import { config } from 'dotenv'
config({ path: '.env.local' })

async function test() {
    console.log('Testing OpenAI Direct Fetch...')
    const apiKey = process.env.OPENAI_API_KEY
    console.log('API Key present:', !!apiKey)

    try {
        const response = await fetch('https://api.openai.com/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${apiKey}`
            },
            body: JSON.stringify({
                model: 'gpt-4o-mini',
                messages: [{ role: 'user', content: 'Say hello' }],
                max_tokens: 5
            })
        })

        if (!response.ok) {
            console.error('Error:', response.status, await response.text())
        } else {
            const data = await response.json()
            console.log('Success:', data.choices[0].message.content)
        }
    } catch (err) {
        console.error('Fetch failed:', err)
    }
}

test()
