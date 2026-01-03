import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { withRateLimit } from '@/lib/rateLimit'

// POST /api/question-advisor
async function handleRequest(request: NextRequest) {
    const supabase = await createClient()

    // Check authentication
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
        return NextResponse.json(
            { error: 'Unauthorized' },
            { status: 401 }
        )
    }

    // Check usage limits
    const { data: limits } = await supabase.rpc('check_ai_usage_limit', {
        p_user_id: user.id,
        p_feature: 'question_advisor'
    })

    if (limits && limits[0] && !limits[0].can_use) {
        return NextResponse.json(
            {
                error: 'Usage limit reached',
                message: 'You have reached your daily limit. Try again tomorrow!',
                daily_remaining: 0,
                monthly_remaining: limits[0].monthly_remaining
            },
            { status: 429 }
        )
    }

    try {
        const { question, context } = await request.json()

        if (!question || typeof question !== 'string') {
            return NextResponse.json(
                { error: 'Question is required' },
                { status: 400 }
            )
        }

        // Get OpenAI API key from environment
        const openaiKey = process.env.OPENAI_API_KEY

        if (!openaiKey) {
            // For now, return mock data if no API key is configured
            // This allows testing the UI without an API key
            const mockResult = generateMockAnalysis(question)

            // Still record usage even for mock
            await supabase.rpc('record_ai_usage', {
                p_user_id: user.id,
                p_feature: 'question_advisor',
                p_tokens: 0
            })

            // Save to question history
            await supabase.from('question_history').insert({
                user_id: user.id,
                question,
                context: context || null,
                clarity_score: mockResult.clarity_score,
                measurability_score: mockResult.visibility?.score || 0,
                scope_assessment: mockResult.scope_analysis?.assessment,
                has_bias: mockResult.bias_detection?.has_bias || false,
                suggestions: mockResult.suggestions || [],
                refined_versions: mockResult.refined_versions || []
            })

            return NextResponse.json(mockResult)
        }

        // Call OpenAI API
        const openaiResponse = await fetch('https://api.openai.com/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${openaiKey}`
            },
            body: JSON.stringify({
                model: 'gpt-4-turbo-preview',
                messages: [
                    {
                        role: 'system',
                        content: `You are an expert research methodology advisor. Analyze research questions for clarity, scope, bias, and measurability. 
                        
Your response must be valid JSON with this exact structure:
{
    "clarity_score": <number 0-100>,
    "scope_analysis": {
        "assessment": "<too_broad|too_narrow|appropriate>",
        "explanation": "<string explaining scope issues or confirming appropriate scope>"
    },
    "bias_detection": {
        "has_bias": <boolean>,
        "biases": ["<list of identified biases, empty if none>"]
    },
    "measurability": {
        "score": <number 0-100>,
        "explanation": "<string explaining how measurable/testable the question is>"
    },
    "suggestions": ["<list of specific improvement suggestions>"],
    "refined_versions": ["<3 refined versions of the question>"]
}

Be constructive and specific. Focus on actionable improvements.`
                    },
                    {
                        role: 'user',
                        content: `Analyze this research question:

"${question}"

${context ? `Additional context: ${context}` : ''}`
                    }
                ],
                temperature: 0.7,
                max_tokens: 1500
            })
        })

        if (!openaiResponse.ok) {
            const errorData = await openaiResponse.json()
            console.error('OpenAI API error:', errorData)
            throw new Error('Failed to analyze question')
        }

        const openaiData = await openaiResponse.json()
        const content = openaiData.choices[0]?.message?.content

        if (!content) {
            throw new Error('No response from AI')
        }

        // Parse the JSON response
        let analysisResult
        try {
            // Try to extract JSON from the response (in case there's extra text)
            const jsonMatch = content.match(/\{[\s\S]*\}/)
            if (jsonMatch) {
                analysisResult = JSON.parse(jsonMatch[0])
            } else {
                throw new Error('No JSON found in response')
            }
        } catch (parseError) {
            console.error('Failed to parse AI response:', content)
            // Return mock data as fallback
            analysisResult = generateMockAnalysis(question)
        }

        // Record usage
        const tokensUsed = openaiData.usage?.total_tokens || 0
        await supabase.rpc('record_ai_usage', {
            p_user_id: user.id,
            p_feature: 'question_advisor',
            p_tokens: tokensUsed
        })

        // Save to question history
        await supabase.from('question_history').insert({
            user_id: user.id,
            question,
            context: context || null,
            clarity_score: analysisResult.clarity_score,
            measurability_score: analysisResult.measurability?.score || 0,
            scope_assessment: analysisResult.scope_analysis?.assessment,
            has_bias: analysisResult.bias_detection?.has_bias || false,
            suggestions: analysisResult.suggestions || [],
            refined_versions: analysisResult.refined_versions || []
        })

        return NextResponse.json(analysisResult)

    } catch (error: any) {
        console.error('Question advisor error:', error)
        return NextResponse.json(
            { error: 'Failed to analyze question', message: error.message },
            { status: 500 }
        )
    }
}

export const POST = withRateLimit('ai')(handleRequest)

// Generate mock analysis for testing without API key
function generateMockAnalysis(question: string): any {
    const questionLower = question.toLowerCase()

    // Basic heuristics for mock scoring
    const hasSpecificTerms = /how|what|why|when|where|which|who/i.test(question)
    const isLong = question.length > 50
    const hasQuestionMark = question.includes('?')
    const hasBiasWords = /best|worst|always|never|should|must|obviously/i.test(question)
    const isVague = /things|stuff|something|anything/i.test(question)

    let clarityScore = 50
    if (hasSpecificTerms) clarityScore += 15
    if (hasQuestionMark) clarityScore += 10
    if (isLong && !isVague) clarityScore += 10
    if (!isVague) clarityScore += 10
    if (!hasBiasWords) clarityScore += 5
    clarityScore = Math.min(100, clarityScore)

    let measurabilityScore = 40
    if (/measure|effect|impact|relationship|correlation|cause|result/i.test(question)) {
        measurabilityScore += 30
    }
    if (/how many|how much|what percent|rate|frequency/i.test(question)) {
        measurabilityScore += 20
    }
    measurabilityScore = Math.min(100, measurabilityScore)

    const scopeAssessment = question.length < 30 ? 'too_narrow' :
        question.length > 200 ? 'too_broad' : 'appropriate'

    const biases = []
    if (/best|worst/i.test(question)) biases.push('Superlative language suggests predetermined conclusions')
    if (/should/i.test(question)) biases.push('Prescriptive framing may limit objective analysis')
    if (/obviously|clearly/i.test(question)) biases.push('Assumption language indicates potential confirmation bias')

    return {
        clarity_score: clarityScore,
        scope_analysis: {
            assessment: scopeAssessment,
            explanation: scopeAssessment === 'appropriate'
                ? 'The scope of your question appears well-defined and researchable within typical constraints.'
                : scopeAssessment === 'too_broad'
                    ? 'Your question covers a wide scope. Consider narrowing down to specific variables, time periods, or populations.'
                    : 'Your question may be too specific. Consider broadening to ensure sufficient data availability.'
        },
        bias_detection: {
            has_bias: biases.length > 0,
            biases: biases
        },
        visibility: {
            score: measurabilityScore,
            explanation: measurabilityScore >= 70
                ? 'Your question includes measurable concepts that can be operationalized for research.'
                : 'Consider making your question more specific about what will be measured or observed.'
        },
        suggestions: [
            hasSpecificTerms ? 'Good use of interrogative words.' : 'Start with a clear interrogative (how, what, why).',
            hasQuestionMark ? '' : 'End your question with a question mark for clarity.',
            isVague ? 'Replace vague terms with specific concepts.' : '',
            hasBiasWords ? 'Consider using more neutral language.' : ''
        ].filter(Boolean),
        refined_versions: [
            `What is the relationship between ${extractKeyTerms(question)} in the context of ${getRandomContext()}?`,
            `How does ${extractKeyTerms(question)} affect ${getRandomOutcome()} among ${getRandomPopulation()}?`,
            `To what extent does ${extractKeyTerms(question)} influence ${getRandomOutcome()}?`
        ]
    }
}

function extractKeyTerms(question: string): string {
    const words = question.replace(/[?.,!]/g, '').split(' ')
    const stopWords = ['the', 'a', 'an', 'is', 'are', 'was', 'were', 'be', 'been', 'being', 'have', 'has', 'had', 'do', 'does', 'did', 'will', 'would', 'could', 'should', 'may', 'might', 'can', 'how', 'what', 'why', 'when', 'where', 'which', 'who']
    const keywords = words.filter(w => w.length > 3 && !stopWords.includes(w.toLowerCase()))
    return keywords.slice(0, 3).join(' and ') || 'the studied variables'
}

function getRandomContext(): string {
    const contexts = ['modern organizations', 'educational settings', 'urban environments', 'developing economies', 'digital platforms']
    return contexts[Math.floor(Math.random() * contexts.length)]
}

function getRandomOutcome(): string {
    const outcomes = ['performance outcomes', 'behavioral patterns', 'decision-making processes', 'social dynamics', 'economic indicators']
    return outcomes[Math.floor(Math.random() * outcomes.length)]
}

function getRandomPopulation(): string {
    const populations = ['young adults', 'professionals', 'students', 'community members', 'stakeholders']
    return populations[Math.floor(Math.random() * populations.length)]
}
