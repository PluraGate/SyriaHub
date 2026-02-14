(globalThis.TURBOPACK || (globalThis.TURBOPACK = [])).push([typeof document === "object" ? document.currentScript : undefined,
"[project]/RiderProjects/SyriaHub/node_modules/@milkdown/exception/lib/index.js [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "callCommandBeforeEditorView",
    ()=>callCommandBeforeEditorView,
    "contextNotFound",
    ()=>contextNotFound,
    "createNodeInParserFail",
    ()=>createNodeInParserFail,
    "ctxCallOutOfScope",
    ()=>ctxCallOutOfScope,
    "ctxNotBind",
    ()=>ctxNotBind,
    "docTypeError",
    ()=>docTypeError,
    "expectDomTypeError",
    ()=>expectDomTypeError,
    "getAtomFromSchemaFail",
    ()=>getAtomFromSchemaFail,
    "missingMarkInSchema",
    ()=>missingMarkInSchema,
    "missingNodeInSchema",
    ()=>missingNodeInSchema,
    "missingRootElement",
    ()=>missingRootElement,
    "missingYjsDoc",
    ()=>missingYjsDoc,
    "parserMatchError",
    ()=>parserMatchError,
    "serializerMatchError",
    ()=>serializerMatchError,
    "stackOverFlow",
    ()=>stackOverFlow,
    "timerNotFound",
    ()=>timerNotFound
]);
var ErrorCode = /* @__PURE__ */ ((ErrorCode2)=>{
    ErrorCode2["docTypeError"] = "docTypeError";
    ErrorCode2["contextNotFound"] = "contextNotFound";
    ErrorCode2["timerNotFound"] = "timerNotFound";
    ErrorCode2["ctxCallOutOfScope"] = "ctxCallOutOfScope";
    ErrorCode2["createNodeInParserFail"] = "createNodeInParserFail";
    ErrorCode2["stackOverFlow"] = "stackOverFlow";
    ErrorCode2["parserMatchError"] = "parserMatchError";
    ErrorCode2["serializerMatchError"] = "serializerMatchError";
    ErrorCode2["getAtomFromSchemaFail"] = "getAtomFromSchemaFail";
    ErrorCode2["expectDomTypeError"] = "expectDomTypeError";
    ErrorCode2["callCommandBeforeEditorView"] = "callCommandBeforeEditorView";
    ErrorCode2["missingRootElement"] = "missingRootElement";
    ErrorCode2["missingNodeInSchema"] = "missingNodeInSchema";
    ErrorCode2["missingMarkInSchema"] = "missingMarkInSchema";
    ErrorCode2["ctxNotBind"] = "ctxNotBind";
    ErrorCode2["missingYjsDoc"] = "missingYjsDoc";
    return ErrorCode2;
})(ErrorCode || {});
class MilkdownError extends Error {
    constructor(code, message){
        super(message);
        this.name = "MilkdownError";
        this.code = code;
    }
}
const functionReplacer = (_, value)=>typeof value === "function" ? "[Function]" : value;
const stringify = (x)=>JSON.stringify(x, functionReplacer);
function docTypeError(type) {
    return new MilkdownError(ErrorCode.docTypeError, `Doc type error, unsupported type: ${stringify(type)}`);
}
function contextNotFound(name) {
    return new MilkdownError(ErrorCode.contextNotFound, `Context "${name}" not found, do you forget to inject it?`);
}
function timerNotFound(name) {
    return new MilkdownError(ErrorCode.timerNotFound, `Timer "${name}" not found, do you forget to record it?`);
}
function ctxCallOutOfScope() {
    return new MilkdownError(ErrorCode.ctxCallOutOfScope, "Should not call a context out of the plugin.");
}
function createNodeInParserFail(nodeType, attrs, content) {
    const nodeTypeName = "name" in nodeType ? nodeType.name : nodeType;
    const heading = `Cannot create node for ${nodeTypeName}`;
    const serialize = (x)=>{
        if (x == null) return "null";
        if (Array.isArray(x)) {
            return `[${x.map(serialize).join(", ")}]`;
        }
        if (typeof x === "object") {
            if ("toJSON" in x && typeof x.toJSON === "function") {
                return JSON.stringify(x.toJSON());
            }
            if ("spec" in x) {
                return JSON.stringify(x.spec);
            }
            return JSON.stringify(x);
        }
        if (typeof x === "string" || typeof x === "number" || typeof x === "boolean") {
            return JSON.stringify(x);
        }
        if (typeof x === "function") {
            return `[Function: ${x.name || "anonymous"}]`;
        }
        try {
            return String(x);
        } catch  {
            return "[Unserializable]";
        }
    };
    const headingMessage = [
        "[Description]",
        heading
    ];
    const attrsMessage = [
        "[Attributes]",
        attrs
    ];
    const contentMessage = [
        "[Content]",
        (content ?? []).map((node)=>{
            if (!node) return "null";
            if (typeof node === "object" && "type" in node) {
                return `${node}`;
            }
            return serialize(node);
        })
    ];
    const messages = [
        headingMessage,
        attrsMessage,
        contentMessage
    ].reduce((acc, [title, value])=>{
        const message = `${title}: ${serialize(value)}.`;
        return acc.concat(message);
    }, []);
    return new MilkdownError(ErrorCode.createNodeInParserFail, messages.join("\n"));
}
function stackOverFlow() {
    return new MilkdownError(ErrorCode.stackOverFlow, "Stack over flow, cannot pop on an empty stack.");
}
function parserMatchError(node) {
    return new MilkdownError(ErrorCode.parserMatchError, `Cannot match target parser for node: ${stringify(node)}.`);
}
function serializerMatchError(node) {
    return new MilkdownError(ErrorCode.serializerMatchError, `Cannot match target serializer for node: ${stringify(node)}.`);
}
function getAtomFromSchemaFail(type, name) {
    return new MilkdownError(ErrorCode.getAtomFromSchemaFail, `Cannot get ${type}: ${name} from schema.`);
}
function expectDomTypeError(node) {
    return new MilkdownError(ErrorCode.expectDomTypeError, `Expect to be a dom, but get: ${stringify(node)}.`);
}
function callCommandBeforeEditorView() {
    return new MilkdownError(ErrorCode.callCommandBeforeEditorView, "You're trying to call a command before editor view initialized, make sure to get commandManager from ctx after editor view has been initialized");
}
function missingRootElement() {
    return new MilkdownError(ErrorCode.missingRootElement, "Missing root element, milkdown cannot find root element of the editor.");
}
function missingNodeInSchema(name) {
    return new MilkdownError(ErrorCode.missingNodeInSchema, `Missing node in schema, milkdown cannot find "${name}" in schema.`);
}
function missingMarkInSchema(name) {
    return new MilkdownError(ErrorCode.missingMarkInSchema, `Missing mark in schema, milkdown cannot find "${name}" in schema.`);
}
function ctxNotBind() {
    return new MilkdownError(ErrorCode.ctxNotBind, "Context not bind, please make sure the plugin has been initialized.");
}
function missingYjsDoc() {
    return new MilkdownError(ErrorCode.missingYjsDoc, "Missing yjs doc, please make sure you have bind one.");
}
;
 //# sourceMappingURL=index.js.map
}),
"[project]/RiderProjects/SyriaHub/node_modules/@milkdown/ctx/lib/index.js [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "Clock",
    ()=>Clock,
    "Container",
    ()=>Container,
    "Ctx",
    ()=>Ctx,
    "Inspector",
    ()=>Inspector,
    "Slice",
    ()=>Slice,
    "SliceType",
    ()=>SliceType,
    "Timer",
    ()=>Timer,
    "TimerType",
    ()=>TimerType,
    "createSlice",
    ()=>createSlice,
    "createTimer",
    ()=>createTimer
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$RiderProjects$2f$SyriaHub$2f$node_modules$2f40$milkdown$2f$exception$2f$lib$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/RiderProjects/SyriaHub/node_modules/@milkdown/exception/lib/index.js [app-client] (ecmascript)");
;
class Container {
    constructor(){
        this.sliceMap = /* @__PURE__ */ new Map();
        this.get = (slice)=>{
            const context = typeof slice === "string" ? [
                ...this.sliceMap.values()
            ].find((x)=>x.type.name === slice) : this.sliceMap.get(slice.id);
            if (!context) {
                const name = typeof slice === "string" ? slice : slice.name;
                throw (0, __TURBOPACK__imported__module__$5b$project$5d2f$RiderProjects$2f$SyriaHub$2f$node_modules$2f40$milkdown$2f$exception$2f$lib$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["contextNotFound"])(name);
            }
            return context;
        };
        this.remove = (slice)=>{
            const context = typeof slice === "string" ? [
                ...this.sliceMap.values()
            ].find((x)=>x.type.name === slice) : this.sliceMap.get(slice.id);
            if (!context) return;
            this.sliceMap.delete(context.type.id);
        };
        this.has = (slice)=>{
            if (typeof slice === "string") return [
                ...this.sliceMap.values()
            ].some((x)=>x.type.name === slice);
            return this.sliceMap.has(slice.id);
        };
    }
}
class Slice {
    /// @internal
    constructor(container, value, type){
        this.#watchers = [];
        this.#emit = ()=>{
            this.#watchers.forEach((watcher)=>watcher(this.#value));
        };
        this.set = (value2)=>{
            this.#value = value2;
            this.#emit();
        };
        this.get = ()=>this.#value;
        this.update = (updater)=>{
            this.#value = updater(this.#value);
            this.#emit();
        };
        this.type = type;
        this.#value = value;
        container.set(type.id, this);
    }
    #watchers;
    /// @internal
    #value;
    #emit;
    /// Add a watcher for changes in the slice.
    /// Returns a function to remove the watcher.
    on(watcher) {
        this.#watchers.push(watcher);
        return ()=>{
            this.#watchers = this.#watchers.filter((w)=>w !== watcher);
        };
    }
    /// Add a one-time watcher for changes in the slice.
    /// The watcher will be removed after it is called.
    /// Returns a function to remove the watcher.
    once(watcher) {
        const off = this.on((value)=>{
            watcher(value);
            off();
        });
        return off;
    }
    /// Remove a watcher.
    off(watcher) {
        this.#watchers = this.#watchers.filter((w)=>w !== watcher);
    }
    /// Remove all watchers.
    offAll() {
        this.#watchers = [];
    }
}
class SliceType {
    /// Create a slice type with a default value and a name.
    /// The name should be unique in the container.
    constructor(value, name){
        this.id = Symbol(`Context-${name}`);
        this.name = name;
        this._defaultValue = value;
        this._typeInfo = ()=>{
            throw (0, __TURBOPACK__imported__module__$5b$project$5d2f$RiderProjects$2f$SyriaHub$2f$node_modules$2f40$milkdown$2f$exception$2f$lib$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["ctxCallOutOfScope"])();
        };
    }
    /// Create a slice with a container.
    /// You can also pass a value to override the default value.
    create(container, value = this._defaultValue) {
        return new Slice(container, value, this);
    }
}
const createSlice = (value, name)=>new SliceType(value, name);
class Inspector {
    /// Create an inspector with container, clock and metadata.
    constructor(container, clock, meta){
        this.#injectedSlices = /* @__PURE__ */ new Set();
        this.#consumedSlices = /* @__PURE__ */ new Set();
        this.#recordedTimers = /* @__PURE__ */ new Map();
        this.#waitTimers = /* @__PURE__ */ new Map();
        this.read = ()=>{
            return {
                metadata: this.#meta,
                injectedSlices: [
                    ...this.#injectedSlices
                ].map((slice)=>({
                        name: typeof slice === "string" ? slice : slice.name,
                        value: this.#getSlice(slice)
                    })),
                consumedSlices: [
                    ...this.#consumedSlices
                ].map((slice)=>({
                        name: typeof slice === "string" ? slice : slice.name,
                        value: this.#getSlice(slice)
                    })),
                recordedTimers: [
                    ...this.#recordedTimers
                ].map(([timer, { duration }])=>({
                        name: timer.name,
                        duration,
                        status: this.#getTimer(timer)
                    })),
                waitTimers: [
                    ...this.#waitTimers
                ].map(([timer, { duration }])=>({
                        name: timer.name,
                        duration,
                        status: this.#getTimer(timer)
                    }))
            };
        };
        this.onRecord = (timerType)=>{
            this.#recordedTimers.set(timerType, {
                start: Date.now(),
                duration: 0
            });
        };
        this.onClear = (timerType)=>{
            this.#recordedTimers.delete(timerType);
        };
        this.onDone = (timerType)=>{
            const timer = this.#recordedTimers.get(timerType);
            if (!timer) return;
            timer.duration = Date.now() - timer.start;
        };
        this.onWait = (timerType, promise)=>{
            const start = Date.now();
            promise.finally(()=>{
                this.#waitTimers.set(timerType, {
                    duration: Date.now() - start
                });
            }).catch(console.error);
        };
        this.onInject = (sliceType)=>{
            this.#injectedSlices.add(sliceType);
        };
        this.onRemove = (sliceType)=>{
            this.#injectedSlices.delete(sliceType);
        };
        this.onUse = (sliceType)=>{
            this.#consumedSlices.add(sliceType);
        };
        this.#getSlice = (sliceType)=>{
            return this.#container.get(sliceType).get();
        };
        this.#getTimer = (timerType)=>{
            return this.#clock.get(timerType).status;
        };
        this.#container = container;
        this.#clock = clock;
        this.#meta = meta;
    }
    /// @internal
    #meta;
    /// @internal
    #container;
    /// @internal
    #clock;
    #injectedSlices;
    #consumedSlices;
    #recordedTimers;
    #waitTimers;
    #getSlice;
    #getTimer;
}
class Ctx {
    /// Create a ctx object with container and clock.
    constructor(container, clock, meta){
        this.produce = (meta2)=>{
            if (meta2 && Object.keys(meta2).length) return new Ctx(this.#container, this.#clock, {
                ...meta2
            });
            return this;
        };
        this.inject = (sliceType, value)=>{
            const slice = sliceType.create(this.#container.sliceMap);
            if (value != null) slice.set(value);
            this.#inspector?.onInject(sliceType);
            return this;
        };
        this.remove = (sliceType)=>{
            this.#container.remove(sliceType);
            this.#inspector?.onRemove(sliceType);
            return this;
        };
        this.record = (timerType)=>{
            timerType.create(this.#clock.store);
            this.#inspector?.onRecord(timerType);
            return this;
        };
        this.clearTimer = (timerType)=>{
            this.#clock.remove(timerType);
            this.#inspector?.onClear(timerType);
            return this;
        };
        this.isInjected = (sliceType)=>this.#container.has(sliceType);
        this.isRecorded = (timerType)=>this.#clock.has(timerType);
        this.use = (sliceType)=>{
            this.#inspector?.onUse(sliceType);
            return this.#container.get(sliceType);
        };
        this.get = (sliceType)=>this.use(sliceType).get();
        this.set = (sliceType, value)=>this.use(sliceType).set(value);
        this.update = (sliceType, updater)=>this.use(sliceType).update(updater);
        this.timer = (timer)=>this.#clock.get(timer);
        this.done = (timer)=>{
            this.timer(timer).done();
            this.#inspector?.onDone(timer);
        };
        this.wait = (timer)=>{
            const promise = this.timer(timer).start();
            this.#inspector?.onWait(timer, promise);
            return promise;
        };
        this.waitTimers = async (slice)=>{
            await Promise.all(this.get(slice).map((x)=>this.wait(x)));
        };
        this.#container = container;
        this.#clock = clock;
        this.#meta = meta;
        if (meta) this.#inspector = new Inspector(container, clock, meta);
    }
    /// @internal
    #container;
    /// @internal
    #clock;
    /// @internal
    #meta;
    /// @internal
    #inspector;
    /// Get metadata of the ctx.
    get meta() {
        return this.#meta;
    }
    /// Get the inspector of the ctx.
    get inspector() {
        return this.#inspector;
    }
}
class Clock {
    constructor(){
        this.store = /* @__PURE__ */ new Map();
        this.get = (timer)=>{
            const meta = this.store.get(timer.id);
            if (!meta) throw (0, __TURBOPACK__imported__module__$5b$project$5d2f$RiderProjects$2f$SyriaHub$2f$node_modules$2f40$milkdown$2f$exception$2f$lib$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["timerNotFound"])(timer.name);
            return meta;
        };
        this.remove = (timer)=>{
            this.store.delete(timer.id);
        };
        this.has = (timer)=>{
            return this.store.has(timer.id);
        };
    }
}
class Timer {
    /// @internal
    constructor(clock, type){
        this.#promise = null;
        this.#listener = null;
        this.#status = "pending";
        this.start = ()=>{
            this.#promise ??= new Promise((resolve, reject)=>{
                this.#listener = (e)=>{
                    if (!(e instanceof CustomEvent)) return;
                    if (e.detail.id === this.#eventUniqId) {
                        this.#status = "resolved";
                        this.#removeListener();
                        e.stopImmediatePropagation();
                        resolve();
                    }
                };
                this.#waitTimeout(()=>{
                    if (this.#status === "pending") this.#status = "rejected";
                    this.#removeListener();
                    reject(new Error(`Timing ${this.type.name} timeout.`));
                });
                this.#status = "pending";
                addEventListener(this.type.name, this.#listener);
            });
            return this.#promise;
        };
        this.done = ()=>{
            const event = new CustomEvent(this.type.name, {
                detail: {
                    id: this.#eventUniqId
                }
            });
            dispatchEvent(event);
        };
        this.#removeListener = ()=>{
            if (this.#listener) removeEventListener(this.type.name, this.#listener);
        };
        this.#waitTimeout = (ifTimeout)=>{
            setTimeout(()=>{
                ifTimeout();
            }, this.type.timeout);
        };
        this.#eventUniqId = Symbol(type.name);
        this.type = type;
        clock.set(type.id, this);
    }
    #promise;
    #listener;
    /// @internal
    #eventUniqId;
    #status;
    /// The status of the timer.
    /// Can be `pending`, `resolved` or `rejected`.
    get status() {
        return this.#status;
    }
    #removeListener;
    #waitTimeout;
}
class TimerType {
    /// Create a timer type with a name and a timeout.
    /// The name should be unique in the clock.
    constructor(name, timeout = 3e3){
        this.create = (clock)=>{
            return new Timer(clock, this);
        };
        this.id = Symbol(`Timer-${name}`);
        this.name = name;
        this.timeout = timeout;
    }
}
const createTimer = (name, timeout = 3e3)=>new TimerType(name, timeout);
;
 //# sourceMappingURL=index.js.map
}),
"[project]/RiderProjects/SyriaHub/node_modules/@milkdown/transformer/lib/index.js [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "ParserState",
    ()=>ParserState,
    "SerializerState",
    ()=>SerializerState,
    "Stack",
    ()=>Stack,
    "StackElement",
    ()=>StackElement
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$RiderProjects$2f$SyriaHub$2f$node_modules$2f40$milkdown$2f$exception$2f$lib$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/RiderProjects/SyriaHub/node_modules/@milkdown/exception/lib/index.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$RiderProjects$2f$SyriaHub$2f$node_modules$2f$prosemirror$2d$model$2f$dist$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/RiderProjects/SyriaHub/node_modules/prosemirror-model/dist/index.js [app-client] (ecmascript)");
var __typeError = (msg)=>{
    throw TypeError(msg);
};
var __accessCheck = (obj, member, msg)=>member.has(obj) || __typeError("Cannot " + msg);
var __privateGet = (obj, member, getter)=>(__accessCheck(obj, member, "read from private field"), getter ? getter.call(obj) : member.get(obj));
var __privateAdd = (obj, member, value)=>member.has(obj) ? __typeError("Cannot add the same private member more than once") : member instanceof WeakSet ? member.add(obj) : member.set(obj, value);
var __privateSet = (obj, member, value, setter)=>(__accessCheck(obj, member, "write to private field"), setter ? setter.call(obj, value) : member.set(obj, value), value);
var _marks, _hasText, _maybeMerge, _matchTarget, _runNode, _closeNodeAndPush, _addNodeAndPush, _marks2, _matchTarget2, _runProseNode, _runProseMark, _runNode2, _searchType, _maybeMergeChildren, _createMarkdownNode, _moveSpaces, _closeNodeAndPush2, _addNodeAndPush2, _openMark, _closeMark;
;
;
class StackElement {
}
class Stack {
    constructor(){
        this.elements = [];
        this.size = ()=>{
            return this.elements.length;
        };
        this.top = ()=>{
            return this.elements.at(-1);
        };
        this.push = (node)=>{
            this.top()?.push(node);
        };
        this.open = (node)=>{
            this.elements.push(node);
        };
        this.close = ()=>{
            const el = this.elements.pop();
            if (!el) throw (0, __TURBOPACK__imported__module__$5b$project$5d2f$RiderProjects$2f$SyriaHub$2f$node_modules$2f40$milkdown$2f$exception$2f$lib$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["stackOverFlow"])();
            return el;
        };
    }
}
class ParserStackElement extends StackElement {
    constructor(type, content, attrs){
        super();
        this.type = type;
        this.content = content;
        this.attrs = attrs;
    }
    push(node, ...rest) {
        this.content.push(node, ...rest);
    }
    pop() {
        return this.content.pop();
    }
    static create(type, content, attrs) {
        return new ParserStackElement(type, content, attrs);
    }
}
const _ParserState = class _ParserState extends Stack {
    /// @internal
    constructor(schema){
        super();
        __privateAdd(this, _marks);
        __privateAdd(this, _hasText);
        __privateAdd(this, _maybeMerge);
        __privateAdd(this, _matchTarget);
        __privateAdd(this, _runNode);
        __privateAdd(this, _closeNodeAndPush);
        __privateAdd(this, _addNodeAndPush);
        __privateSet(this, _marks, __TURBOPACK__imported__module__$5b$project$5d2f$RiderProjects$2f$SyriaHub$2f$node_modules$2f$prosemirror$2d$model$2f$dist$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Mark"].none);
        __privateSet(this, _hasText, (node)=>node.isText);
        __privateSet(this, _maybeMerge, (a, b)=>{
            if (__privateGet(this, _hasText).call(this, a) && __privateGet(this, _hasText).call(this, b) && __TURBOPACK__imported__module__$5b$project$5d2f$RiderProjects$2f$SyriaHub$2f$node_modules$2f$prosemirror$2d$model$2f$dist$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Mark"].sameSet(a.marks, b.marks)) return this.schema.text(a.text + b.text, a.marks);
            return void 0;
        });
        __privateSet(this, _matchTarget, (node)=>{
            const result = Object.values({
                ...this.schema.nodes,
                ...this.schema.marks
            }).find((x)=>{
                const spec = x.spec;
                return spec.parseMarkdown.match(node);
            });
            if (!result) throw (0, __TURBOPACK__imported__module__$5b$project$5d2f$RiderProjects$2f$SyriaHub$2f$node_modules$2f40$milkdown$2f$exception$2f$lib$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["parserMatchError"])(node);
            return result;
        });
        __privateSet(this, _runNode, (node)=>{
            const type = __privateGet(this, _matchTarget).call(this, node);
            const spec = type.spec;
            spec.parseMarkdown.runner(this, node, type);
        });
        this.injectRoot = (node, nodeType, attrs)=>{
            this.openNode(nodeType, attrs);
            this.next(node.children);
            return this;
        };
        this.openNode = (nodeType, attrs)=>{
            this.open(ParserStackElement.create(nodeType, [], attrs));
            return this;
        };
        __privateSet(this, _closeNodeAndPush, ()=>{
            __privateSet(this, _marks, __TURBOPACK__imported__module__$5b$project$5d2f$RiderProjects$2f$SyriaHub$2f$node_modules$2f$prosemirror$2d$model$2f$dist$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Mark"].none);
            const element = this.close();
            return __privateGet(this, _addNodeAndPush).call(this, element.type, element.attrs, element.content);
        });
        this.closeNode = ()=>{
            try {
                __privateGet(this, _closeNodeAndPush).call(this);
            } catch (e) {
                console.error(e);
            }
            return this;
        };
        __privateSet(this, _addNodeAndPush, (nodeType, attrs, content)=>{
            const node = nodeType.createAndFill(attrs, content, __privateGet(this, _marks));
            if (!node) throw (0, __TURBOPACK__imported__module__$5b$project$5d2f$RiderProjects$2f$SyriaHub$2f$node_modules$2f40$milkdown$2f$exception$2f$lib$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["createNodeInParserFail"])(nodeType, attrs, content);
            this.push(node);
            return node;
        });
        this.addNode = (nodeType, attrs, content)=>{
            try {
                __privateGet(this, _addNodeAndPush).call(this, nodeType, attrs, content);
            } catch (e) {
                console.error(e);
            }
            return this;
        };
        this.openMark = (markType, attrs)=>{
            const mark = markType.create(attrs);
            __privateSet(this, _marks, mark.addToSet(__privateGet(this, _marks)));
            return this;
        };
        this.closeMark = (markType)=>{
            __privateSet(this, _marks, markType.removeFromSet(__privateGet(this, _marks)));
            return this;
        };
        this.addText = (text)=>{
            try {
                const topElement = this.top();
                if (!topElement) throw (0, __TURBOPACK__imported__module__$5b$project$5d2f$RiderProjects$2f$SyriaHub$2f$node_modules$2f40$milkdown$2f$exception$2f$lib$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["stackOverFlow"])();
                const prevNode = topElement.pop();
                const currNode = this.schema.text(text, __privateGet(this, _marks));
                if (!prevNode) {
                    topElement.push(currNode);
                    return this;
                }
                const merged = __privateGet(this, _maybeMerge).call(this, prevNode, currNode);
                if (merged) {
                    topElement.push(merged);
                    return this;
                }
                topElement.push(prevNode, currNode);
                return this;
            } catch (e) {
                console.error(e);
                return this;
            }
        };
        this.build = ()=>{
            let doc;
            do doc = __privateGet(this, _closeNodeAndPush).call(this);
            while (this.size())
            return doc;
        };
        this.next = (nodes = [])=>{
            [
                nodes
            ].flat().forEach((node)=>__privateGet(this, _runNode).call(this, node));
            return this;
        };
        this.toDoc = ()=>this.build();
        this.run = (remark, markdown)=>{
            const tree = remark.runSync(remark.parse(markdown), markdown);
            this.next(tree);
            return this;
        };
        this.schema = schema;
    }
};
_marks = new WeakMap();
_hasText = new WeakMap();
_maybeMerge = new WeakMap();
_matchTarget = new WeakMap();
_runNode = new WeakMap();
_closeNodeAndPush = new WeakMap();
_addNodeAndPush = new WeakMap();
_ParserState.create = (schema, remark)=>{
    const state = new _ParserState(schema);
    return (text)=>{
        state.run(remark, text);
        return state.toDoc();
    };
};
let ParserState = _ParserState;
const _SerializerStackElement = class _SerializerStackElement extends StackElement {
    constructor(type, children, value, props = {}){
        super();
        this.type = type;
        this.children = children;
        this.value = value;
        this.props = props;
        this.push = (node, ...rest)=>{
            if (!this.children) this.children = [];
            this.children.push(node, ...rest);
        };
        this.pop = ()=>this.children?.pop();
    }
};
_SerializerStackElement.create = (type, children, value, props = {})=>new _SerializerStackElement(type, children, value, props);
let SerializerStackElement = _SerializerStackElement;
const isFragment = (x)=>Object.prototype.hasOwnProperty.call(x, "size");
const _SerializerState = class _SerializerState extends Stack {
    /// @internal
    constructor(schema){
        super();
        __privateAdd(this, _marks2);
        __privateAdd(this, _matchTarget2);
        __privateAdd(this, _runProseNode);
        __privateAdd(this, _runProseMark);
        __privateAdd(this, _runNode2);
        __privateAdd(this, _searchType);
        __privateAdd(this, _maybeMergeChildren);
        __privateAdd(this, _createMarkdownNode);
        __privateAdd(this, _moveSpaces);
        __privateAdd(this, _closeNodeAndPush2);
        __privateAdd(this, _addNodeAndPush2);
        __privateAdd(this, _openMark);
        __privateAdd(this, _closeMark);
        __privateSet(this, _marks2, __TURBOPACK__imported__module__$5b$project$5d2f$RiderProjects$2f$SyriaHub$2f$node_modules$2f$prosemirror$2d$model$2f$dist$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Mark"].none);
        __privateSet(this, _matchTarget2, (node)=>{
            const result = Object.values({
                ...this.schema.nodes,
                ...this.schema.marks
            }).find((x)=>{
                const spec = x.spec;
                return spec.toMarkdown.match(node);
            });
            if (!result) throw (0, __TURBOPACK__imported__module__$5b$project$5d2f$RiderProjects$2f$SyriaHub$2f$node_modules$2f40$milkdown$2f$exception$2f$lib$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["serializerMatchError"])(node.type);
            return result;
        });
        __privateSet(this, _runProseNode, (node)=>{
            const type = __privateGet(this, _matchTarget2).call(this, node);
            const spec = type.spec;
            return spec.toMarkdown.runner(this, node);
        });
        __privateSet(this, _runProseMark, (mark, node)=>{
            const type = __privateGet(this, _matchTarget2).call(this, mark);
            const spec = type.spec;
            return spec.toMarkdown.runner(this, mark, node);
        });
        __privateSet(this, _runNode2, (node)=>{
            const { marks } = node;
            const getPriority = (x)=>x.type.spec.priority ?? 50;
            const tmp = [
                ...marks
            ].sort((a, b)=>getPriority(a) - getPriority(b));
            const unPreventNext = tmp.every((mark)=>!__privateGet(this, _runProseMark).call(this, mark, node));
            if (unPreventNext) __privateGet(this, _runProseNode).call(this, node);
            marks.forEach((mark)=>__privateGet(this, _closeMark).call(this, mark));
        });
        __privateSet(this, _searchType, (child, type)=>{
            if (child.type === type) return child;
            if (child.children?.length !== 1) return child;
            const searchNode = (node2)=>{
                if (node2.type === type) return node2;
                if (node2.children?.length !== 1) return null;
                const [firstChild] = node2.children;
                if (!firstChild) return null;
                return searchNode(firstChild);
            };
            const target = searchNode(child);
            if (!target) return child;
            const tmp = target.children ? [
                ...target.children
            ] : void 0;
            const node = {
                ...child,
                children: tmp
            };
            node.children = tmp;
            target.children = [
                node
            ];
            return target;
        });
        __privateSet(this, _maybeMergeChildren, (node)=>{
            const { children } = node;
            if (!children) return node;
            node.children = children.reduce((nextChildren, child, index)=>{
                if (index === 0) return [
                    child
                ];
                const last = nextChildren.at(-1);
                if (last && last.isMark && child.isMark) {
                    child = __privateGet(this, _searchType).call(this, child, last.type);
                    const { children: currChildren, ...currRest } = child;
                    const { children: prevChildren, ...prevRest } = last;
                    if (child.type === last.type && currChildren && prevChildren && JSON.stringify(currRest) === JSON.stringify(prevRest)) {
                        const next = {
                            ...prevRest,
                            children: [
                                ...prevChildren,
                                ...currChildren
                            ]
                        };
                        return nextChildren.slice(0, -1).concat(__privateGet(this, _maybeMergeChildren).call(this, next));
                    }
                }
                return nextChildren.concat(child);
            }, []);
            return node;
        });
        __privateSet(this, _createMarkdownNode, (element)=>{
            const node = {
                ...element.props,
                type: element.type
            };
            if (element.children) node.children = element.children;
            if (element.value) node.value = element.value;
            return node;
        });
        this.openNode = (type, value, props)=>{
            this.open(SerializerStackElement.create(type, void 0, value, props));
            return this;
        };
        __privateSet(this, _moveSpaces, (element, onPush)=>{
            let startSpaces = "";
            let endSpaces = "";
            const children = element.children;
            let first = -1;
            let last = -1;
            const findIndex = (node)=>{
                if (!node) return;
                node.forEach((child, index)=>{
                    if (child.type === "text" && child.value) {
                        if (first < 0) first = index;
                        last = index;
                    }
                });
            };
            if (children) {
                findIndex(children);
                const lastChild = children?.[last];
                const firstChild = children?.[first];
                if (lastChild && lastChild.value.endsWith(" ")) {
                    const text = lastChild.value;
                    const trimmed = text.trimEnd();
                    endSpaces = text.slice(trimmed.length);
                    lastChild.value = trimmed;
                }
                if (firstChild && firstChild.value.startsWith(" ")) {
                    const text = firstChild.value;
                    const trimmed = text.trimStart();
                    startSpaces = text.slice(0, text.length - trimmed.length);
                    firstChild.value = trimmed;
                }
            }
            if (startSpaces.length) __privateGet(this, _addNodeAndPush2).call(this, "text", void 0, startSpaces);
            const result = onPush();
            if (endSpaces.length) __privateGet(this, _addNodeAndPush2).call(this, "text", void 0, endSpaces);
            return result;
        });
        __privateSet(this, _closeNodeAndPush2, (trim = false)=>{
            const element = this.close();
            const onPush = ()=>__privateGet(this, _addNodeAndPush2).call(this, element.type, element.children, element.value, element.props);
            if (trim) return __privateGet(this, _moveSpaces).call(this, element, onPush);
            return onPush();
        });
        this.closeNode = ()=>{
            __privateGet(this, _closeNodeAndPush2).call(this);
            return this;
        };
        __privateSet(this, _addNodeAndPush2, (type, children, value, props)=>{
            const element = SerializerStackElement.create(type, children, value, props);
            const node = __privateGet(this, _maybeMergeChildren).call(this, __privateGet(this, _createMarkdownNode).call(this, element));
            this.push(node);
            return node;
        });
        this.addNode = (type, children, value, props)=>{
            __privateGet(this, _addNodeAndPush2).call(this, type, children, value, props);
            return this;
        };
        __privateSet(this, _openMark, (mark, type, value, props)=>{
            const isIn = mark.isInSet(__privateGet(this, _marks2));
            if (isIn) return this;
            __privateSet(this, _marks2, mark.addToSet(__privateGet(this, _marks2)));
            return this.openNode(type, value, {
                ...props,
                isMark: true
            });
        });
        __privateSet(this, _closeMark, (mark)=>{
            const isIn = mark.isInSet(__privateGet(this, _marks2));
            if (!isIn) return;
            __privateSet(this, _marks2, mark.type.removeFromSet(__privateGet(this, _marks2)));
            __privateGet(this, _closeNodeAndPush2).call(this, true);
        });
        this.withMark = (mark, type, value, props)=>{
            __privateGet(this, _openMark).call(this, mark, type, value, props);
            return this;
        };
        this.closeMark = (mark)=>{
            __privateGet(this, _closeMark).call(this, mark);
            return this;
        };
        this.build = ()=>{
            let doc = null;
            do doc = __privateGet(this, _closeNodeAndPush2).call(this);
            while (this.size())
            return doc;
        };
        this.next = (nodes)=>{
            if (isFragment(nodes)) {
                nodes.forEach((node)=>{
                    __privateGet(this, _runNode2).call(this, node);
                });
                return this;
            }
            __privateGet(this, _runNode2).call(this, nodes);
            return this;
        };
        this.toString = (remark)=>remark.stringify(this.build());
        this.run = (tree)=>{
            this.next(tree);
            return this;
        };
        this.schema = schema;
    }
};
_marks2 = new WeakMap();
_matchTarget2 = new WeakMap();
_runProseNode = new WeakMap();
_runProseMark = new WeakMap();
_runNode2 = new WeakMap();
_searchType = new WeakMap();
_maybeMergeChildren = new WeakMap();
_createMarkdownNode = new WeakMap();
_moveSpaces = new WeakMap();
_closeNodeAndPush2 = new WeakMap();
_addNodeAndPush2 = new WeakMap();
_openMark = new WeakMap();
_closeMark = new WeakMap();
_SerializerState.create = (schema, remark)=>{
    const state = new _SerializerState(schema);
    return (content)=>{
        state.run(content);
        return state.toString(remark);
    };
};
let SerializerState = _SerializerState;
;
 //# sourceMappingURL=index.js.map
}),
"[project]/RiderProjects/SyriaHub/node_modules/@milkdown/prose/lib/index.js [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "browser",
    ()=>browser,
    "calculateNodePosition",
    ()=>calculateNodePosition,
    "calculateTextPosition",
    ()=>calculateTextPosition,
    "cloneTr",
    ()=>cloneTr,
    "customInputRules",
    ()=>customInputRules,
    "customInputRulesKey",
    ()=>customInputRulesKey,
    "equalNodeType",
    ()=>equalNodeType,
    "findChildren",
    ()=>findChildren,
    "findChildrenByMark",
    ()=>findChildrenByMark,
    "findNodeInSelection",
    ()=>findNodeInSelection,
    "findParent",
    ()=>findParent,
    "findParentNode",
    ()=>findParentNode,
    "findParentNodeClosestToPos",
    ()=>findParentNodeClosestToPos,
    "findParentNodeType",
    ()=>findParentNodeType,
    "findSelectedNodeOfType",
    ()=>findSelectedNodeOfType,
    "flatten",
    ()=>flatten,
    "getMarkFromSchema",
    ()=>getMarkFromSchema,
    "getNodeFromSchema",
    ()=>getNodeFromSchema,
    "isTextOnlySlice",
    ()=>isTextOnlySlice,
    "markRule",
    ()=>markRule,
    "nodeRule",
    ()=>nodeRule,
    "posToDOMRect",
    ()=>posToDOMRect
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$RiderProjects$2f$SyriaHub$2f$node_modules$2f$prosemirror$2d$state$2f$dist$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/RiderProjects/SyriaHub/node_modules/prosemirror-state/dist/index.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$RiderProjects$2f$SyriaHub$2f$node_modules$2f$prosemirror$2d$inputrules$2f$dist$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/RiderProjects/SyriaHub/node_modules/prosemirror-inputrules/dist/index.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$RiderProjects$2f$SyriaHub$2f$node_modules$2f40$milkdown$2f$exception$2f$lib$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/RiderProjects/SyriaHub/node_modules/@milkdown/exception/lib/index.js [app-client] (ecmascript)");
;
;
;
const nav = typeof navigator != "undefined" ? navigator : null;
const doc = typeof document != "undefined" ? document : null;
const agent = nav && nav.userAgent || "";
const ie_edge = /Edge\/(\d+)/.exec(agent);
const ie_upto10 = /MSIE \d/.exec(agent);
const ie_11up = /Trident\/(?:[7-9]|\d{2,})\..*rv:(\d+)/.exec(agent);
const ie = !!(ie_upto10 || ie_11up || ie_edge);
const ie_version = ie_upto10 ? document.documentMode : ie_11up ? +ie_11up[1] : ie_edge ? +ie_edge[1] : 0;
const gecko = !ie && /gecko\/(\d+)/i.test(agent);
const gecko_version = gecko && +(/Firefox\/(\d+)/.exec(agent) || [
    0,
    0
])[1];
const _chrome = !ie && /Chrome\/(\d+)/.exec(agent);
const chrome = !!_chrome;
const chrome_version = _chrome ? +_chrome[1] : 0;
const safari = !ie && !!nav && /Apple Computer/.test(nav.vendor);
const ios = safari && (/Mobile\/\w+/.test(agent) || !!nav && nav.maxTouchPoints > 2);
const mac = ios || (nav ? /Mac/.test(nav.platform) : false);
const android = /Android \d/.test(agent);
const webkit = !!doc && "webkitFontSmoothing" in doc.documentElement.style;
const webkit_version = webkit ? +(/\bAppleWebKit\/(\d+)/.exec(navigator.userAgent) || [
    0,
    0
])[1] : 0;
var browser = /*#__PURE__*/ Object.freeze({
    __proto__: null,
    android: android,
    chrome: chrome,
    chrome_version: chrome_version,
    gecko: gecko,
    gecko_version: gecko_version,
    ie: ie,
    ie_version: ie_version,
    ios: ios,
    mac: mac,
    safari: safari,
    webkit: webkit,
    webkit_version: webkit_version
});
function run(view, from, to, text, rules, plugin) {
    if (view.composing) return false;
    const state = view.state;
    const $from = state.doc.resolve(from);
    if ($from.parent.type.spec.code) return false;
    const textBefore = $from.parent.textBetween(Math.max(0, $from.parentOffset - 500), $from.parentOffset, void 0, "\uFFFC") + text;
    for (let _matcher of rules){
        const matcher = _matcher;
        const match = matcher.match.exec(textBefore);
        const tr = match && match[0] && matcher.handler(state, match, from - (match[0].length - text.length), to);
        if (!tr) continue;
        if (matcher.undoable !== false) tr.setMeta(plugin, {
            transform: tr,
            from,
            to,
            text
        });
        view.dispatch(tr);
        return true;
    }
    return false;
}
const customInputRulesKey = new __TURBOPACK__imported__module__$5b$project$5d2f$RiderProjects$2f$SyriaHub$2f$node_modules$2f$prosemirror$2d$state$2f$dist$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["PluginKey"]("MILKDOWN_CUSTOM_INPUTRULES");
function customInputRules({ rules }) {
    const plugin = new __TURBOPACK__imported__module__$5b$project$5d2f$RiderProjects$2f$SyriaHub$2f$node_modules$2f$prosemirror$2d$state$2f$dist$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Plugin"]({
        key: customInputRulesKey,
        isInputRules: true,
        state: {
            init () {
                return null;
            },
            apply (tr, prev) {
                const stored = tr.getMeta(this);
                if (stored) return stored;
                return tr.selectionSet || tr.docChanged ? null : prev;
            }
        },
        props: {
            handleTextInput (view, from, to, text) {
                return run(view, from, to, text, rules, plugin);
            },
            handleDOMEvents: {
                compositionend: (view)=>{
                    setTimeout(()=>{
                        const { $cursor } = view.state.selection;
                        if ($cursor) run(view, $cursor.pos, $cursor.pos, "", rules, plugin);
                    });
                    return false;
                }
            },
            handleKeyDown (view, event) {
                if (event.key !== "Enter") return false;
                const { $cursor } = view.state.selection;
                if ($cursor) return run(view, $cursor.pos, $cursor.pos, "\n", rules, plugin);
                return false;
            }
        }
    });
    return plugin;
}
function markRule(regexp, markType, options = {}) {
    return new __TURBOPACK__imported__module__$5b$project$5d2f$RiderProjects$2f$SyriaHub$2f$node_modules$2f$prosemirror$2d$inputrules$2f$dist$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["InputRule"](regexp, (state, match, start, end)=>{
        var _a, _b, _c, _d;
        const { tr } = state;
        const matchLength = match.length;
        let group = match[matchLength - 1];
        let fullMatch = match[0];
        let initialStoredMarks = [];
        let markEnd = end;
        const captured = {
            group,
            fullMatch,
            start,
            end
        };
        const result = (_a = options.updateCaptured) == null ? void 0 : _a.call(options, captured);
        Object.assign(captured, result);
        ({ group, fullMatch, start, end } = captured);
        if (fullMatch === null) return null;
        if ((group == null ? void 0 : group.trim()) === "") return null;
        if (group) {
            const startSpaces = fullMatch.search(/\S/);
            const textStart = start + fullMatch.indexOf(group);
            const textEnd = textStart + group.length;
            initialStoredMarks = (_b = tr.storedMarks) != null ? _b : [];
            if (textEnd < end) tr.delete(textEnd, end);
            if (textStart > start) tr.delete(start + startSpaces, textStart);
            markEnd = start + startSpaces + group.length;
            const attrs = (_c = options.getAttr) == null ? void 0 : _c.call(options, match);
            tr.addMark(start, markEnd, markType.create(attrs));
            tr.setStoredMarks(initialStoredMarks);
            (_d = options.beforeDispatch) == null ? void 0 : _d.call(options, {
                match,
                start,
                end,
                tr
            });
        }
        return tr;
    });
}
function nodeRule(regexp, nodeType, options = {}) {
    return new __TURBOPACK__imported__module__$5b$project$5d2f$RiderProjects$2f$SyriaHub$2f$node_modules$2f$prosemirror$2d$inputrules$2f$dist$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["InputRule"](regexp, (state, match, start, end)=>{
        var _a, _b, _c;
        const { tr } = state;
        let group = match[1];
        let fullMatch = match[0];
        const captured = {
            group,
            fullMatch,
            start,
            end
        };
        const result = (_a = options.updateCaptured) == null ? void 0 : _a.call(options, captured);
        Object.assign(captured, result);
        ({ group, fullMatch, start, end } = captured);
        if (fullMatch === null) return null;
        if (!group || group.trim() === "") return null;
        const attrs = (_b = options.getAttr) == null ? void 0 : _b.call(options, match);
        const node = nodeType.createAndFill(attrs);
        if (node) {
            tr.replaceRangeWith(nodeType.isBlock ? tr.doc.resolve(start).before() : start, end, node);
            (_c = options.beforeDispatch) == null ? void 0 : _c.call(options, {
                match: [
                    fullMatch,
                    group != null ? group : ""
                ],
                start,
                end,
                tr
            });
        }
        return tr;
    });
}
var __defProp = Object.defineProperty;
var __defProps = Object.defineProperties;
var __getOwnPropDescs = Object.getOwnPropertyDescriptors;
var __getOwnPropSymbols = Object.getOwnPropertySymbols;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __propIsEnum = Object.prototype.propertyIsEnumerable;
var __defNormalProp = (obj, key, value)=>key in obj ? __defProp(obj, key, {
        enumerable: true,
        configurable: true,
        writable: true,
        value
    }) : obj[key] = value;
var __spreadValues = (a, b)=>{
    for(var prop in b || (b = {}))if (__hasOwnProp.call(b, prop)) __defNormalProp(a, prop, b[prop]);
    if (__getOwnPropSymbols) for (var prop of __getOwnPropSymbols(b)){
        if (__propIsEnum.call(b, prop)) __defNormalProp(a, prop, b[prop]);
    }
    return a;
};
var __spreadProps = (a, b)=>__defProps(a, __getOwnPropDescs(b));
function calculateNodePosition(view, target, handler) {
    const state = view.state;
    const { from } = state.selection;
    const { node } = view.domAtPos(from);
    const element = node instanceof Text ? node.parentElement : node;
    if (!(element instanceof HTMLElement)) throw (0, __TURBOPACK__imported__module__$5b$project$5d2f$RiderProjects$2f$SyriaHub$2f$node_modules$2f40$milkdown$2f$exception$2f$lib$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["expectDomTypeError"])(element);
    const selectedNodeRect = element.getBoundingClientRect();
    const targetNodeRect = target.getBoundingClientRect();
    const parent = target.parentElement;
    if (!parent) throw (0, __TURBOPACK__imported__module__$5b$project$5d2f$RiderProjects$2f$SyriaHub$2f$node_modules$2f40$milkdown$2f$exception$2f$lib$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["expectDomTypeError"])(parent);
    const parentNodeRect = parent.getBoundingClientRect();
    const [top, left] = handler(selectedNodeRect, targetNodeRect, parentNodeRect);
    target.style.top = `${top}px`;
    target.style.left = `${left}px`;
}
function calculateTextPosition(view, target, handler) {
    const state = view.state;
    const { from, to } = state.selection;
    const start = view.coordsAtPos(from);
    const end = view.coordsAtPos(to);
    const targetNodeRect = target.getBoundingClientRect();
    const parent = target.parentElement;
    if (!parent) throw (0, __TURBOPACK__imported__module__$5b$project$5d2f$RiderProjects$2f$SyriaHub$2f$node_modules$2f40$milkdown$2f$exception$2f$lib$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["missingRootElement"])();
    const parentNodeRect = parent.getBoundingClientRect();
    const [top, left] = handler(start, end, targetNodeRect, parentNodeRect);
    target.style.top = `${top}px`;
    target.style.left = `${left}px`;
}
function minMax(value = 0, min = 0, max = 0) {
    return Math.min(Math.max(value, min), max);
}
function posToDOMRect(view, from, to) {
    const minPos = 0;
    const maxPos = view.state.doc.content.size;
    const resolvedFrom = minMax(from, minPos, maxPos);
    const resolvedEnd = minMax(to, minPos, maxPos);
    const start = view.coordsAtPos(resolvedFrom);
    const end = view.coordsAtPos(resolvedEnd, -1);
    const top = Math.min(start.top, end.top);
    const bottom = Math.max(start.bottom, end.bottom);
    const left = Math.min(start.left, end.left);
    const right = Math.max(start.right, end.right);
    const width = right - left;
    const height = bottom - top;
    const x = left;
    const y = top;
    const data = {
        top,
        bottom,
        left,
        right,
        width,
        height,
        x,
        y
    };
    return __spreadProps(__spreadValues({}, data), {
        toJSON: ()=>data
    });
}
function cloneTr(tr) {
    return Object.assign(Object.create(tr), tr).setTime(Date.now());
}
function equalNodeType(nodeType, node) {
    return Array.isArray(nodeType) && nodeType.includes(node.type) || node.type === nodeType;
}
function isTextOnlySlice(slice) {
    if (slice.content.childCount === 1) {
        const node = slice.content.firstChild;
        if ((node == null ? void 0 : node.type.name) === "text" && node.marks.length === 0) return node;
        if ((node == null ? void 0 : node.type.name) === "paragraph" && node.childCount === 1) {
            const _node = node.firstChild;
            if ((_node == null ? void 0 : _node.type.name) === "text" && _node.marks.length === 0) return _node;
        }
    }
    return false;
}
function flatten(node, descend = true) {
    const result = [];
    node.descendants((child, pos)=>{
        result.push({
            node: child,
            pos
        });
        if (!descend) return false;
        return void 0;
    });
    return result;
}
function findChildren(predicate) {
    return (node, descend)=>flatten(node, descend).filter((child)=>predicate(child.node));
}
function findChildrenByMark(node, markType, descend) {
    return findChildren((child)=>Boolean(markType.isInSet(child.marks)))(node, descend);
}
function findParent(predicate) {
    return ($pos)=>{
        for(let depth = $pos.depth; depth > 0; depth -= 1){
            const node = $pos.node(depth);
            if (predicate(node)) {
                const from = $pos.before(depth);
                const to = $pos.after(depth);
                return {
                    from,
                    to,
                    node
                };
            }
        }
        return void 0;
    };
}
function findParentNodeType($pos, nodeType) {
    return findParent((node)=>node.type === nodeType)($pos);
}
function getNodeFromSchema(type, schema) {
    const target = schema.nodes[type];
    if (!target) throw (0, __TURBOPACK__imported__module__$5b$project$5d2f$RiderProjects$2f$SyriaHub$2f$node_modules$2f40$milkdown$2f$exception$2f$lib$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["getAtomFromSchemaFail"])("node", type);
    return target;
}
function getMarkFromSchema(type, schema) {
    const target = schema.marks[type];
    if (!target) throw (0, __TURBOPACK__imported__module__$5b$project$5d2f$RiderProjects$2f$SyriaHub$2f$node_modules$2f40$milkdown$2f$exception$2f$lib$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["getAtomFromSchemaFail"])("mark", type);
    return target;
}
function findParentNodeClosestToPos(predicate) {
    return ($pos)=>{
        for(let i = $pos.depth; i > 0; i--){
            const node = $pos.node(i);
            if (predicate(node)) {
                return {
                    pos: i > 0 ? $pos.before(i) : 0,
                    start: $pos.start(i),
                    depth: i,
                    node
                };
            }
        }
        return void 0;
    };
}
function findParentNode(predicate) {
    return (selection)=>{
        return findParentNodeClosestToPos(predicate)(selection.$from);
    };
}
function findSelectedNodeOfType(selection, nodeType) {
    if (!(selection instanceof __TURBOPACK__imported__module__$5b$project$5d2f$RiderProjects$2f$SyriaHub$2f$node_modules$2f$prosemirror$2d$state$2f$dist$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["NodeSelection"])) return;
    const { node, $from } = selection;
    if (equalNodeType(nodeType, node)) return {
        node,
        pos: $from.pos,
        start: $from.start($from.depth),
        depth: $from.depth
    };
    return void 0;
}
const findNodeInSelection = (state, node)=>{
    const { selection, doc } = state;
    if (selection instanceof __TURBOPACK__imported__module__$5b$project$5d2f$RiderProjects$2f$SyriaHub$2f$node_modules$2f$prosemirror$2d$state$2f$dist$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["NodeSelection"]) {
        return {
            hasNode: selection.node.type === node,
            pos: selection.from,
            target: selection.node
        };
    }
    const { from, to } = selection;
    let hasNode = false;
    let pos = -1;
    let target = null;
    doc.nodesBetween(from, to, (n, p)=>{
        if (target) return false;
        if (n.type === node) {
            hasNode = true;
            pos = p;
            target = n;
            return false;
        }
        return true;
    });
    return {
        hasNode,
        pos,
        target
    };
};
;
 //# sourceMappingURL=index.js.map
}),
"[project]/RiderProjects/SyriaHub/node_modules/@milkdown/core/lib/index.js [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "CommandManager",
    ()=>CommandManager,
    "CommandsReady",
    ()=>CommandsReady,
    "ConfigReady",
    ()=>ConfigReady,
    "Editor",
    ()=>Editor,
    "EditorStateReady",
    ()=>EditorStateReady,
    "EditorStatus",
    ()=>EditorStatus,
    "EditorViewReady",
    ()=>EditorViewReady,
    "InitReady",
    ()=>InitReady,
    "KeymapManager",
    ()=>KeymapManager,
    "KeymapReady",
    ()=>KeymapReady,
    "ParserReady",
    ()=>ParserReady,
    "PasteRulesReady",
    ()=>PasteRulesReady,
    "SchemaReady",
    ()=>SchemaReady,
    "SerializerReady",
    ()=>SerializerReady,
    "commands",
    ()=>commands,
    "commandsCtx",
    ()=>commandsCtx,
    "commandsTimerCtx",
    ()=>commandsTimerCtx,
    "config",
    ()=>config,
    "createCmdKey",
    ()=>createCmdKey,
    "defaultValueCtx",
    ()=>defaultValueCtx,
    "editorCtx",
    ()=>editorCtx,
    "editorState",
    ()=>editorState,
    "editorStateCtx",
    ()=>editorStateCtx,
    "editorStateOptionsCtx",
    ()=>editorStateOptionsCtx,
    "editorStateTimerCtx",
    ()=>editorStateTimerCtx,
    "editorView",
    ()=>editorView,
    "editorViewCtx",
    ()=>editorViewCtx,
    "editorViewOptionsCtx",
    ()=>editorViewOptionsCtx,
    "editorViewTimerCtx",
    ()=>editorViewTimerCtx,
    "getDoc",
    ()=>getDoc,
    "init",
    ()=>init,
    "initTimerCtx",
    ()=>initTimerCtx,
    "inputRulesCtx",
    ()=>inputRulesCtx,
    "keymap",
    ()=>keymap,
    "keymapCtx",
    ()=>keymapCtx,
    "keymapTimerCtx",
    ()=>keymapTimerCtx,
    "markViewCtx",
    ()=>markViewCtx,
    "marksCtx",
    ()=>marksCtx,
    "nodeViewCtx",
    ()=>nodeViewCtx,
    "nodesCtx",
    ()=>nodesCtx,
    "parser",
    ()=>parser,
    "parserCtx",
    ()=>parserCtx,
    "parserTimerCtx",
    ()=>parserTimerCtx,
    "pasteRule",
    ()=>pasteRule,
    "pasteRulesCtx",
    ()=>pasteRulesCtx,
    "pasteRulesTimerCtx",
    ()=>pasteRulesTimerCtx,
    "prosePluginsCtx",
    ()=>prosePluginsCtx,
    "remarkCtx",
    ()=>remarkCtx,
    "remarkPluginsCtx",
    ()=>remarkPluginsCtx,
    "remarkStringifyOptionsCtx",
    ()=>remarkStringifyOptionsCtx,
    "rootAttrsCtx",
    ()=>rootAttrsCtx,
    "rootCtx",
    ()=>rootCtx,
    "rootDOMCtx",
    ()=>rootDOMCtx,
    "schema",
    ()=>schema,
    "schemaCtx",
    ()=>schemaCtx,
    "schemaTimerCtx",
    ()=>schemaTimerCtx,
    "serializer",
    ()=>serializer,
    "serializerCtx",
    ()=>serializerCtx,
    "serializerTimerCtx",
    ()=>serializerTimerCtx
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$RiderProjects$2f$SyriaHub$2f$node_modules$2f40$milkdown$2f$ctx$2f$lib$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/RiderProjects/SyriaHub/node_modules/@milkdown/ctx/lib/index.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$RiderProjects$2f$SyriaHub$2f$node_modules$2f$prosemirror$2d$model$2f$dist$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/RiderProjects/SyriaHub/node_modules/prosemirror-model/dist/index.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$RiderProjects$2f$SyriaHub$2f$node_modules$2f$remark$2d$parse$2f$lib$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/RiderProjects/SyriaHub/node_modules/remark-parse/lib/index.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$RiderProjects$2f$SyriaHub$2f$node_modules$2f$remark$2d$stringify$2f$lib$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/RiderProjects/SyriaHub/node_modules/remark-stringify/lib/index.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$RiderProjects$2f$SyriaHub$2f$node_modules$2f$unified$2f$lib$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/RiderProjects/SyriaHub/node_modules/unified/lib/index.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$RiderProjects$2f$SyriaHub$2f$node_modules$2f40$milkdown$2f$exception$2f$lib$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/RiderProjects/SyriaHub/node_modules/@milkdown/exception/lib/index.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$RiderProjects$2f$SyriaHub$2f$node_modules$2f40$milkdown$2f$transformer$2f$lib$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/RiderProjects/SyriaHub/node_modules/@milkdown/transformer/lib/index.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$RiderProjects$2f$SyriaHub$2f$node_modules$2f$prosemirror$2d$commands$2f$dist$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/RiderProjects/SyriaHub/node_modules/prosemirror-commands/dist/index.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$RiderProjects$2f$SyriaHub$2f$node_modules$2f$prosemirror$2d$inputrules$2f$dist$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/RiderProjects/SyriaHub/node_modules/prosemirror-inputrules/dist/index.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$RiderProjects$2f$SyriaHub$2f$node_modules$2f40$milkdown$2f$prose$2f$lib$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/RiderProjects/SyriaHub/node_modules/@milkdown/prose/lib/index.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$RiderProjects$2f$SyriaHub$2f$node_modules$2f$prosemirror$2d$keymap$2f$dist$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/RiderProjects/SyriaHub/node_modules/prosemirror-keymap/dist/index.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$RiderProjects$2f$SyriaHub$2f$node_modules$2f$prosemirror$2d$state$2f$dist$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/RiderProjects/SyriaHub/node_modules/prosemirror-state/dist/index.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$RiderProjects$2f$SyriaHub$2f$node_modules$2f$prosemirror$2d$view$2f$dist$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/RiderProjects/SyriaHub/node_modules/prosemirror-view/dist/index.js [app-client] (ecmascript)");
;
;
;
;
;
;
;
;
;
;
;
;
;
function withMeta(plugin, meta) {
    plugin.meta = {
        package: "@milkdown/core",
        group: "System",
        ...meta
    };
    return plugin;
}
const remarkHandlers = {
    text: (node, _, state, info)=>{
        const value = node.value;
        if (/^[^*_\\]*\s+$/.test(value)) {
            return value;
        }
        return state.safe(value, {
            ...info,
            encode: []
        });
    },
    strong: (node, _, state, info)=>{
        const marker = node.marker || state.options.strong || "*";
        const exit = state.enter("strong");
        const tracker = state.createTracker(info);
        let value = tracker.move(marker + marker);
        value += tracker.move(state.containerPhrasing(node, {
            before: value,
            after: marker,
            ...tracker.current()
        }));
        value += tracker.move(marker + marker);
        exit();
        return value;
    },
    emphasis: (node, _, state, info)=>{
        const marker = node.marker || state.options.emphasis || "*";
        const exit = state.enter("emphasis");
        const tracker = state.createTracker(info);
        let value = tracker.move(marker);
        value += tracker.move(state.containerPhrasing(node, {
            before: value,
            after: marker,
            ...tracker.current()
        }));
        value += tracker.move(marker);
        exit();
        return value;
    }
};
const editorViewCtx = (0, __TURBOPACK__imported__module__$5b$project$5d2f$RiderProjects$2f$SyriaHub$2f$node_modules$2f40$milkdown$2f$ctx$2f$lib$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["createSlice"])({}, "editorView");
const editorStateCtx = (0, __TURBOPACK__imported__module__$5b$project$5d2f$RiderProjects$2f$SyriaHub$2f$node_modules$2f40$milkdown$2f$ctx$2f$lib$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["createSlice"])({}, "editorState");
const initTimerCtx = (0, __TURBOPACK__imported__module__$5b$project$5d2f$RiderProjects$2f$SyriaHub$2f$node_modules$2f40$milkdown$2f$ctx$2f$lib$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["createSlice"])([], "initTimer");
const editorCtx = (0, __TURBOPACK__imported__module__$5b$project$5d2f$RiderProjects$2f$SyriaHub$2f$node_modules$2f40$milkdown$2f$ctx$2f$lib$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["createSlice"])({}, "editor");
const inputRulesCtx = (0, __TURBOPACK__imported__module__$5b$project$5d2f$RiderProjects$2f$SyriaHub$2f$node_modules$2f40$milkdown$2f$ctx$2f$lib$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["createSlice"])([], "inputRules");
const prosePluginsCtx = (0, __TURBOPACK__imported__module__$5b$project$5d2f$RiderProjects$2f$SyriaHub$2f$node_modules$2f40$milkdown$2f$ctx$2f$lib$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["createSlice"])([], "prosePlugins");
const remarkPluginsCtx = (0, __TURBOPACK__imported__module__$5b$project$5d2f$RiderProjects$2f$SyriaHub$2f$node_modules$2f40$milkdown$2f$ctx$2f$lib$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["createSlice"])([], "remarkPlugins");
const nodeViewCtx = (0, __TURBOPACK__imported__module__$5b$project$5d2f$RiderProjects$2f$SyriaHub$2f$node_modules$2f40$milkdown$2f$ctx$2f$lib$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["createSlice"])([], "nodeView");
const markViewCtx = (0, __TURBOPACK__imported__module__$5b$project$5d2f$RiderProjects$2f$SyriaHub$2f$node_modules$2f40$milkdown$2f$ctx$2f$lib$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["createSlice"])([], "markView");
const remarkCtx = (0, __TURBOPACK__imported__module__$5b$project$5d2f$RiderProjects$2f$SyriaHub$2f$node_modules$2f40$milkdown$2f$ctx$2f$lib$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["createSlice"])((0, __TURBOPACK__imported__module__$5b$project$5d2f$RiderProjects$2f$SyriaHub$2f$node_modules$2f$unified$2f$lib$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["unified"])().use(__TURBOPACK__imported__module__$5b$project$5d2f$RiderProjects$2f$SyriaHub$2f$node_modules$2f$remark$2d$parse$2f$lib$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"]).use(__TURBOPACK__imported__module__$5b$project$5d2f$RiderProjects$2f$SyriaHub$2f$node_modules$2f$remark$2d$stringify$2f$lib$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"]), "remark");
const remarkStringifyOptionsCtx = (0, __TURBOPACK__imported__module__$5b$project$5d2f$RiderProjects$2f$SyriaHub$2f$node_modules$2f40$milkdown$2f$ctx$2f$lib$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["createSlice"])({
    handlers: remarkHandlers,
    encode: []
}, "remarkStringifyOptions");
const ConfigReady = (0, __TURBOPACK__imported__module__$5b$project$5d2f$RiderProjects$2f$SyriaHub$2f$node_modules$2f40$milkdown$2f$ctx$2f$lib$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["createTimer"])("ConfigReady");
function config(configure) {
    const plugin = (ctx)=>{
        ctx.record(ConfigReady);
        return async ()=>{
            await configure(ctx);
            ctx.done(ConfigReady);
            return ()=>{
                ctx.clearTimer(ConfigReady);
            };
        };
    };
    withMeta(plugin, {
        displayName: "Config"
    });
    return plugin;
}
const InitReady = (0, __TURBOPACK__imported__module__$5b$project$5d2f$RiderProjects$2f$SyriaHub$2f$node_modules$2f40$milkdown$2f$ctx$2f$lib$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["createTimer"])("InitReady");
function init(editor) {
    const plugin = (ctx)=>{
        ctx.inject(editorCtx, editor).inject(prosePluginsCtx, []).inject(remarkPluginsCtx, []).inject(inputRulesCtx, []).inject(nodeViewCtx, []).inject(markViewCtx, []).inject(remarkStringifyOptionsCtx, {
            handlers: remarkHandlers,
            encode: []
        }).inject(remarkCtx, (0, __TURBOPACK__imported__module__$5b$project$5d2f$RiderProjects$2f$SyriaHub$2f$node_modules$2f$unified$2f$lib$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["unified"])().use(__TURBOPACK__imported__module__$5b$project$5d2f$RiderProjects$2f$SyriaHub$2f$node_modules$2f$remark$2d$parse$2f$lib$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"]).use(__TURBOPACK__imported__module__$5b$project$5d2f$RiderProjects$2f$SyriaHub$2f$node_modules$2f$remark$2d$stringify$2f$lib$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"])).inject(initTimerCtx, [
            ConfigReady
        ]).record(InitReady);
        return async ()=>{
            await ctx.waitTimers(initTimerCtx);
            const options = ctx.get(remarkStringifyOptionsCtx);
            ctx.set(remarkCtx, (0, __TURBOPACK__imported__module__$5b$project$5d2f$RiderProjects$2f$SyriaHub$2f$node_modules$2f$unified$2f$lib$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["unified"])().use(__TURBOPACK__imported__module__$5b$project$5d2f$RiderProjects$2f$SyriaHub$2f$node_modules$2f$remark$2d$parse$2f$lib$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"]).use(__TURBOPACK__imported__module__$5b$project$5d2f$RiderProjects$2f$SyriaHub$2f$node_modules$2f$remark$2d$stringify$2f$lib$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"], options));
            ctx.done(InitReady);
            return ()=>{
                ctx.remove(editorCtx).remove(prosePluginsCtx).remove(remarkPluginsCtx).remove(inputRulesCtx).remove(nodeViewCtx).remove(markViewCtx).remove(remarkStringifyOptionsCtx).remove(remarkCtx).remove(initTimerCtx).clearTimer(InitReady);
            };
        };
    };
    withMeta(plugin, {
        displayName: "Init"
    });
    return plugin;
}
const SchemaReady = (0, __TURBOPACK__imported__module__$5b$project$5d2f$RiderProjects$2f$SyriaHub$2f$node_modules$2f40$milkdown$2f$ctx$2f$lib$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["createTimer"])("SchemaReady");
const schemaTimerCtx = (0, __TURBOPACK__imported__module__$5b$project$5d2f$RiderProjects$2f$SyriaHub$2f$node_modules$2f40$milkdown$2f$ctx$2f$lib$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["createSlice"])([], "schemaTimer");
const schemaCtx = (0, __TURBOPACK__imported__module__$5b$project$5d2f$RiderProjects$2f$SyriaHub$2f$node_modules$2f40$milkdown$2f$ctx$2f$lib$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["createSlice"])({}, "schema");
const nodesCtx = (0, __TURBOPACK__imported__module__$5b$project$5d2f$RiderProjects$2f$SyriaHub$2f$node_modules$2f40$milkdown$2f$ctx$2f$lib$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["createSlice"])([], "nodes");
const marksCtx = (0, __TURBOPACK__imported__module__$5b$project$5d2f$RiderProjects$2f$SyriaHub$2f$node_modules$2f40$milkdown$2f$ctx$2f$lib$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["createSlice"])([], "marks");
function extendPriority(x) {
    return {
        ...x,
        parseDOM: x.parseDOM?.map((rule)=>({
                priority: x.priority,
                ...rule
            }))
    };
}
const schema = (ctx)=>{
    ctx.inject(schemaCtx, {}).inject(nodesCtx, []).inject(marksCtx, []).inject(schemaTimerCtx, [
        InitReady
    ]).record(SchemaReady);
    return async ()=>{
        await ctx.waitTimers(schemaTimerCtx);
        const remark = ctx.get(remarkCtx);
        const remarkPlugins = ctx.get(remarkPluginsCtx);
        const processor = remarkPlugins.reduce((acc, plug)=>acc.use(plug.plugin, plug.options), remark);
        ctx.set(remarkCtx, processor);
        const nodes = Object.fromEntries(ctx.get(nodesCtx).map(([key2, x])=>[
                key2,
                extendPriority(x)
            ]));
        const marks = Object.fromEntries(ctx.get(marksCtx).map(([key2, x])=>[
                key2,
                extendPriority(x)
            ]));
        const schema2 = new __TURBOPACK__imported__module__$5b$project$5d2f$RiderProjects$2f$SyriaHub$2f$node_modules$2f$prosemirror$2d$model$2f$dist$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Schema"]({
            nodes,
            marks
        });
        ctx.set(schemaCtx, schema2);
        ctx.done(SchemaReady);
        return ()=>{
            ctx.remove(schemaCtx).remove(nodesCtx).remove(marksCtx).remove(schemaTimerCtx).clearTimer(SchemaReady);
        };
    };
};
withMeta(schema, {
    displayName: "Schema"
});
class CommandManager {
    constructor(){
        this.#container = new __TURBOPACK__imported__module__$5b$project$5d2f$RiderProjects$2f$SyriaHub$2f$node_modules$2f40$milkdown$2f$ctx$2f$lib$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Container"]();
        this.#ctx = null;
        this.setCtx = (ctx)=>{
            this.#ctx = ctx;
        };
        this.chain = ()=>{
            if (this.#ctx == null) throw (0, __TURBOPACK__imported__module__$5b$project$5d2f$RiderProjects$2f$SyriaHub$2f$node_modules$2f40$milkdown$2f$exception$2f$lib$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["callCommandBeforeEditorView"])();
            const ctx = this.#ctx;
            const commands2 = [];
            const get = this.get.bind(this);
            const chains = {
                run: ()=>{
                    const chained = (0, __TURBOPACK__imported__module__$5b$project$5d2f$RiderProjects$2f$SyriaHub$2f$node_modules$2f$prosemirror$2d$commands$2f$dist$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["chainCommands"])(...commands2);
                    const view = ctx.get(editorViewCtx);
                    return chained(view.state, view.dispatch, view);
                },
                inline: (command)=>{
                    commands2.push(command);
                    return chains;
                },
                pipe: pipe.bind(this)
            };
            function pipe(slice, payload) {
                const cmd = get(slice);
                commands2.push(cmd(payload));
                return chains;
            }
            return chains;
        };
    }
    #container;
    #ctx;
    get ctx() {
        return this.#ctx;
    }
    /// Register a command into the manager.
    create(meta, value) {
        const slice = meta.create(this.#container.sliceMap);
        slice.set(value);
        return slice;
    }
    get(slice) {
        return this.#container.get(slice).get();
    }
    remove(slice) {
        return this.#container.remove(slice);
    }
    call(slice, payload) {
        if (this.#ctx == null) throw (0, __TURBOPACK__imported__module__$5b$project$5d2f$RiderProjects$2f$SyriaHub$2f$node_modules$2f40$milkdown$2f$exception$2f$lib$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["callCommandBeforeEditorView"])();
        const cmd = this.get(slice);
        const command = cmd(payload);
        const view = this.#ctx.get(editorViewCtx);
        return command(view.state, view.dispatch, view);
    }
    /// Call an inline command.
    inline(command) {
        if (this.#ctx == null) throw (0, __TURBOPACK__imported__module__$5b$project$5d2f$RiderProjects$2f$SyriaHub$2f$node_modules$2f40$milkdown$2f$exception$2f$lib$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["callCommandBeforeEditorView"])();
        const view = this.#ctx.get(editorViewCtx);
        return command(view.state, view.dispatch, view);
    }
}
function createCmdKey(key2 = "cmdKey") {
    return (0, __TURBOPACK__imported__module__$5b$project$5d2f$RiderProjects$2f$SyriaHub$2f$node_modules$2f40$milkdown$2f$ctx$2f$lib$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["createSlice"])(()=>()=>false, key2);
}
const commandsCtx = (0, __TURBOPACK__imported__module__$5b$project$5d2f$RiderProjects$2f$SyriaHub$2f$node_modules$2f40$milkdown$2f$ctx$2f$lib$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["createSlice"])(new CommandManager(), "commands");
const commandsTimerCtx = (0, __TURBOPACK__imported__module__$5b$project$5d2f$RiderProjects$2f$SyriaHub$2f$node_modules$2f40$milkdown$2f$ctx$2f$lib$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["createSlice"])([
    SchemaReady
], "commandsTimer");
const CommandsReady = (0, __TURBOPACK__imported__module__$5b$project$5d2f$RiderProjects$2f$SyriaHub$2f$node_modules$2f40$milkdown$2f$ctx$2f$lib$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["createTimer"])("CommandsReady");
const commands = (ctx)=>{
    const cmd = new CommandManager();
    cmd.setCtx(ctx);
    ctx.inject(commandsCtx, cmd).inject(commandsTimerCtx, [
        SchemaReady
    ]).record(CommandsReady);
    return async ()=>{
        await ctx.waitTimers(commandsTimerCtx);
        ctx.done(CommandsReady);
        return ()=>{
            ctx.remove(commandsCtx).remove(commandsTimerCtx).clearTimer(CommandsReady);
        };
    };
};
withMeta(commands, {
    displayName: "Commands"
});
function overrideBaseKeymap(keymap2) {
    const handleBackspace = (0, __TURBOPACK__imported__module__$5b$project$5d2f$RiderProjects$2f$SyriaHub$2f$node_modules$2f$prosemirror$2d$commands$2f$dist$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["chainCommands"])(__TURBOPACK__imported__module__$5b$project$5d2f$RiderProjects$2f$SyriaHub$2f$node_modules$2f$prosemirror$2d$inputrules$2f$dist$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["undoInputRule"], __TURBOPACK__imported__module__$5b$project$5d2f$RiderProjects$2f$SyriaHub$2f$node_modules$2f$prosemirror$2d$commands$2f$dist$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["deleteSelection"], __TURBOPACK__imported__module__$5b$project$5d2f$RiderProjects$2f$SyriaHub$2f$node_modules$2f$prosemirror$2d$commands$2f$dist$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["joinTextblockBackward"], __TURBOPACK__imported__module__$5b$project$5d2f$RiderProjects$2f$SyriaHub$2f$node_modules$2f$prosemirror$2d$commands$2f$dist$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["selectNodeBackward"]);
    keymap2.Backspace = handleBackspace;
    return keymap2;
}
class KeymapManager {
    constructor(){
        this.#ctx = null;
        this.#keymap = [];
        this.setCtx = (ctx)=>{
            this.#ctx = ctx;
        };
        this.add = (keymap2)=>{
            this.#keymap.push(keymap2);
            return ()=>{
                this.#keymap = this.#keymap.filter((item)=>item !== keymap2);
            };
        };
        this.addObjectKeymap = (keymaps)=>{
            const remove = [];
            Object.entries(keymaps).forEach(([key2, command])=>{
                if (typeof command === "function") {
                    const keymapItem = {
                        key: key2,
                        onRun: ()=>command
                    };
                    this.#keymap.push(keymapItem);
                    remove.push(()=>{
                        this.#keymap = this.#keymap.filter((item)=>item !== keymapItem);
                    });
                } else {
                    this.#keymap.push(command);
                    remove.push(()=>{
                        this.#keymap = this.#keymap.filter((item)=>item !== command);
                    });
                }
            });
            return ()=>{
                remove.forEach((fn)=>fn());
            };
        };
        this.addBaseKeymap = ()=>{
            const base = overrideBaseKeymap(__TURBOPACK__imported__module__$5b$project$5d2f$RiderProjects$2f$SyriaHub$2f$node_modules$2f$prosemirror$2d$commands$2f$dist$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["baseKeymap"]);
            return this.addObjectKeymap(base);
        };
        this.build = ()=>{
            const keymap2 = {};
            this.#keymap.forEach((item)=>{
                keymap2[item.key] = [
                    ...keymap2[item.key] || [],
                    item
                ];
            });
            const output = Object.fromEntries(Object.entries(keymap2).map(([key2, items])=>{
                const sortedItems = items.sort((a, b)=>(b.priority ?? 50) - (a.priority ?? 50));
                const command = (state, dispatch, view)=>{
                    const ctx = this.#ctx;
                    if (ctx == null) throw (0, __TURBOPACK__imported__module__$5b$project$5d2f$RiderProjects$2f$SyriaHub$2f$node_modules$2f40$milkdown$2f$exception$2f$lib$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["ctxCallOutOfScope"])();
                    const commands2 = sortedItems.map((item)=>item.onRun(ctx));
                    const chained = (0, __TURBOPACK__imported__module__$5b$project$5d2f$RiderProjects$2f$SyriaHub$2f$node_modules$2f$prosemirror$2d$commands$2f$dist$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["chainCommands"])(...commands2);
                    return chained(state, dispatch, view);
                };
                return [
                    key2,
                    command
                ];
            }));
            return output;
        };
    }
    #ctx;
    #keymap;
    get ctx() {
        return this.#ctx;
    }
}
const keymapCtx = (0, __TURBOPACK__imported__module__$5b$project$5d2f$RiderProjects$2f$SyriaHub$2f$node_modules$2f40$milkdown$2f$ctx$2f$lib$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["createSlice"])(new KeymapManager(), "keymap");
const keymapTimerCtx = (0, __TURBOPACK__imported__module__$5b$project$5d2f$RiderProjects$2f$SyriaHub$2f$node_modules$2f40$milkdown$2f$ctx$2f$lib$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["createSlice"])([
    SchemaReady
], "keymapTimer");
const KeymapReady = (0, __TURBOPACK__imported__module__$5b$project$5d2f$RiderProjects$2f$SyriaHub$2f$node_modules$2f40$milkdown$2f$ctx$2f$lib$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["createTimer"])("KeymapReady");
const keymap = (ctx)=>{
    const km = new KeymapManager();
    km.setCtx(ctx);
    ctx.inject(keymapCtx, km).inject(keymapTimerCtx, [
        SchemaReady
    ]).record(KeymapReady);
    return async ()=>{
        await ctx.waitTimers(keymapTimerCtx);
        ctx.done(KeymapReady);
        return ()=>{
            ctx.remove(keymapCtx).remove(keymapTimerCtx).clearTimer(KeymapReady);
        };
    };
};
const ParserReady = (0, __TURBOPACK__imported__module__$5b$project$5d2f$RiderProjects$2f$SyriaHub$2f$node_modules$2f40$milkdown$2f$ctx$2f$lib$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["createTimer"])("ParserReady");
const outOfScope$1 = ()=>{
    throw (0, __TURBOPACK__imported__module__$5b$project$5d2f$RiderProjects$2f$SyriaHub$2f$node_modules$2f40$milkdown$2f$exception$2f$lib$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["ctxCallOutOfScope"])();
};
const parserCtx = (0, __TURBOPACK__imported__module__$5b$project$5d2f$RiderProjects$2f$SyriaHub$2f$node_modules$2f40$milkdown$2f$ctx$2f$lib$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["createSlice"])(outOfScope$1, "parser");
const parserTimerCtx = (0, __TURBOPACK__imported__module__$5b$project$5d2f$RiderProjects$2f$SyriaHub$2f$node_modules$2f40$milkdown$2f$ctx$2f$lib$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["createSlice"])([], "parserTimer");
const parser = (ctx)=>{
    ctx.inject(parserCtx, outOfScope$1).inject(parserTimerCtx, [
        SchemaReady
    ]).record(ParserReady);
    return async ()=>{
        await ctx.waitTimers(parserTimerCtx);
        const remark = ctx.get(remarkCtx);
        const schema2 = ctx.get(schemaCtx);
        ctx.set(parserCtx, __TURBOPACK__imported__module__$5b$project$5d2f$RiderProjects$2f$SyriaHub$2f$node_modules$2f40$milkdown$2f$transformer$2f$lib$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["ParserState"].create(schema2, remark));
        ctx.done(ParserReady);
        return ()=>{
            ctx.remove(parserCtx).remove(parserTimerCtx).clearTimer(ParserReady);
        };
    };
};
withMeta(parser, {
    displayName: "Parser"
});
const SerializerReady = (0, __TURBOPACK__imported__module__$5b$project$5d2f$RiderProjects$2f$SyriaHub$2f$node_modules$2f40$milkdown$2f$ctx$2f$lib$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["createTimer"])("SerializerReady");
const serializerTimerCtx = (0, __TURBOPACK__imported__module__$5b$project$5d2f$RiderProjects$2f$SyriaHub$2f$node_modules$2f40$milkdown$2f$ctx$2f$lib$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["createSlice"])([], "serializerTimer");
const outOfScope = ()=>{
    throw (0, __TURBOPACK__imported__module__$5b$project$5d2f$RiderProjects$2f$SyriaHub$2f$node_modules$2f40$milkdown$2f$exception$2f$lib$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["ctxCallOutOfScope"])();
};
const serializerCtx = (0, __TURBOPACK__imported__module__$5b$project$5d2f$RiderProjects$2f$SyriaHub$2f$node_modules$2f40$milkdown$2f$ctx$2f$lib$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["createSlice"])(outOfScope, "serializer");
const serializer = (ctx)=>{
    ctx.inject(serializerCtx, outOfScope).inject(serializerTimerCtx, [
        SchemaReady
    ]).record(SerializerReady);
    return async ()=>{
        await ctx.waitTimers(serializerTimerCtx);
        const remark = ctx.get(remarkCtx);
        const schema2 = ctx.get(schemaCtx);
        ctx.set(serializerCtx, __TURBOPACK__imported__module__$5b$project$5d2f$RiderProjects$2f$SyriaHub$2f$node_modules$2f40$milkdown$2f$transformer$2f$lib$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["SerializerState"].create(schema2, remark));
        ctx.done(SerializerReady);
        return ()=>{
            ctx.remove(serializerCtx).remove(serializerTimerCtx).clearTimer(SerializerReady);
        };
    };
};
withMeta(serializer, {
    displayName: "Serializer"
});
const defaultValueCtx = (0, __TURBOPACK__imported__module__$5b$project$5d2f$RiderProjects$2f$SyriaHub$2f$node_modules$2f40$milkdown$2f$ctx$2f$lib$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["createSlice"])("", "defaultValue");
const editorStateOptionsCtx = (0, __TURBOPACK__imported__module__$5b$project$5d2f$RiderProjects$2f$SyriaHub$2f$node_modules$2f40$milkdown$2f$ctx$2f$lib$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["createSlice"])((x)=>x, "stateOptions");
const editorStateTimerCtx = (0, __TURBOPACK__imported__module__$5b$project$5d2f$RiderProjects$2f$SyriaHub$2f$node_modules$2f40$milkdown$2f$ctx$2f$lib$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["createSlice"])([], "editorStateTimer");
const EditorStateReady = (0, __TURBOPACK__imported__module__$5b$project$5d2f$RiderProjects$2f$SyriaHub$2f$node_modules$2f40$milkdown$2f$ctx$2f$lib$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["createTimer"])("EditorStateReady");
function getDoc(defaultValue, parser2, schema2) {
    if (typeof defaultValue === "string") return parser2(defaultValue);
    if (defaultValue.type === "html") return __TURBOPACK__imported__module__$5b$project$5d2f$RiderProjects$2f$SyriaHub$2f$node_modules$2f$prosemirror$2d$model$2f$dist$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["DOMParser"].fromSchema(schema2).parse(defaultValue.dom);
    if (defaultValue.type === "json") return __TURBOPACK__imported__module__$5b$project$5d2f$RiderProjects$2f$SyriaHub$2f$node_modules$2f$prosemirror$2d$model$2f$dist$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Node"].fromJSON(schema2, defaultValue.value);
    throw (0, __TURBOPACK__imported__module__$5b$project$5d2f$RiderProjects$2f$SyriaHub$2f$node_modules$2f40$milkdown$2f$exception$2f$lib$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["docTypeError"])(defaultValue);
}
const key$1 = new __TURBOPACK__imported__module__$5b$project$5d2f$RiderProjects$2f$SyriaHub$2f$node_modules$2f$prosemirror$2d$state$2f$dist$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["PluginKey"]("MILKDOWN_STATE_TRACKER");
const editorState = (ctx)=>{
    ctx.inject(defaultValueCtx, "").inject(editorStateCtx, {}).inject(editorStateOptionsCtx, (x)=>x).inject(editorStateTimerCtx, [
        ParserReady,
        SerializerReady,
        CommandsReady,
        KeymapReady
    ]).record(EditorStateReady);
    return async ()=>{
        await ctx.waitTimers(editorStateTimerCtx);
        const schema2 = ctx.get(schemaCtx);
        const parser2 = ctx.get(parserCtx);
        const rules = ctx.get(inputRulesCtx);
        const optionsOverride = ctx.get(editorStateOptionsCtx);
        const prosePlugins = ctx.get(prosePluginsCtx);
        const defaultValue = ctx.get(defaultValueCtx);
        const doc = getDoc(defaultValue, parser2, schema2);
        const km = ctx.get(keymapCtx);
        const disposeBaseKeymap = km.addBaseKeymap();
        const plugins = [
            ...prosePlugins,
            new __TURBOPACK__imported__module__$5b$project$5d2f$RiderProjects$2f$SyriaHub$2f$node_modules$2f$prosemirror$2d$state$2f$dist$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Plugin"]({
                key: key$1,
                state: {
                    init: ()=>{},
                    apply: (_tr, _value, _oldState, newState)=>{
                        ctx.set(editorStateCtx, newState);
                    }
                }
            }),
            (0, __TURBOPACK__imported__module__$5b$project$5d2f$RiderProjects$2f$SyriaHub$2f$node_modules$2f40$milkdown$2f$prose$2f$lib$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["customInputRules"])({
                rules
            }),
            (0, __TURBOPACK__imported__module__$5b$project$5d2f$RiderProjects$2f$SyriaHub$2f$node_modules$2f$prosemirror$2d$keymap$2f$dist$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["keymap"])(km.build())
        ];
        ctx.set(prosePluginsCtx, plugins);
        const options = optionsOverride({
            schema: schema2,
            doc,
            plugins
        });
        const state = __TURBOPACK__imported__module__$5b$project$5d2f$RiderProjects$2f$SyriaHub$2f$node_modules$2f$prosemirror$2d$state$2f$dist$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["EditorState"].create(options);
        ctx.set(editorStateCtx, state);
        ctx.done(EditorStateReady);
        return ()=>{
            disposeBaseKeymap();
            ctx.remove(defaultValueCtx).remove(editorStateCtx).remove(editorStateOptionsCtx).remove(editorStateTimerCtx).clearTimer(EditorStateReady);
        };
    };
};
withMeta(editorState, {
    displayName: "EditorState"
});
const pasteRulesCtx = (0, __TURBOPACK__imported__module__$5b$project$5d2f$RiderProjects$2f$SyriaHub$2f$node_modules$2f40$milkdown$2f$ctx$2f$lib$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["createSlice"])([], "pasteRule");
const pasteRulesTimerCtx = (0, __TURBOPACK__imported__module__$5b$project$5d2f$RiderProjects$2f$SyriaHub$2f$node_modules$2f40$milkdown$2f$ctx$2f$lib$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["createSlice"])([
    SchemaReady
], "pasteRuleTimer");
const PasteRulesReady = (0, __TURBOPACK__imported__module__$5b$project$5d2f$RiderProjects$2f$SyriaHub$2f$node_modules$2f40$milkdown$2f$ctx$2f$lib$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["createTimer"])("PasteRuleReady");
const pasteRule = (ctx)=>{
    ctx.inject(pasteRulesCtx, []).inject(pasteRulesTimerCtx, [
        SchemaReady
    ]).record(PasteRulesReady);
    return async ()=>{
        await ctx.waitTimers(pasteRulesTimerCtx);
        ctx.done(PasteRulesReady);
        return ()=>{
            ctx.remove(pasteRulesCtx).remove(pasteRulesTimerCtx).clearTimer(PasteRulesReady);
        };
    };
};
withMeta(pasteRule, {
    displayName: "PasteRule"
});
const EditorViewReady = (0, __TURBOPACK__imported__module__$5b$project$5d2f$RiderProjects$2f$SyriaHub$2f$node_modules$2f40$milkdown$2f$ctx$2f$lib$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["createTimer"])("EditorViewReady");
const editorViewTimerCtx = (0, __TURBOPACK__imported__module__$5b$project$5d2f$RiderProjects$2f$SyriaHub$2f$node_modules$2f40$milkdown$2f$ctx$2f$lib$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["createSlice"])([], "editorViewTimer");
const editorViewOptionsCtx = (0, __TURBOPACK__imported__module__$5b$project$5d2f$RiderProjects$2f$SyriaHub$2f$node_modules$2f40$milkdown$2f$ctx$2f$lib$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["createSlice"])({}, "editorViewOptions");
const rootCtx = (0, __TURBOPACK__imported__module__$5b$project$5d2f$RiderProjects$2f$SyriaHub$2f$node_modules$2f40$milkdown$2f$ctx$2f$lib$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["createSlice"])(null, "root");
const rootDOMCtx = (0, __TURBOPACK__imported__module__$5b$project$5d2f$RiderProjects$2f$SyriaHub$2f$node_modules$2f40$milkdown$2f$ctx$2f$lib$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["createSlice"])(null, "rootDOM");
const rootAttrsCtx = (0, __TURBOPACK__imported__module__$5b$project$5d2f$RiderProjects$2f$SyriaHub$2f$node_modules$2f40$milkdown$2f$ctx$2f$lib$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["createSlice"])({}, "rootAttrs");
function createViewContainer(root, ctx) {
    const container = document.createElement("div");
    container.className = "milkdown";
    root.appendChild(container);
    ctx.set(rootDOMCtx, container);
    const attrs = ctx.get(rootAttrsCtx);
    Object.entries(attrs).forEach(([key2, value])=>container.setAttribute(key2, value));
    return container;
}
function prepareViewDom(dom) {
    dom.classList.add("editor");
    dom.setAttribute("role", "textbox");
}
const key = new __TURBOPACK__imported__module__$5b$project$5d2f$RiderProjects$2f$SyriaHub$2f$node_modules$2f$prosemirror$2d$state$2f$dist$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["PluginKey"]("MILKDOWN_VIEW_CLEAR");
const editorView = (ctx)=>{
    ctx.inject(rootCtx, document.body).inject(editorViewCtx, {}).inject(editorViewOptionsCtx, {}).inject(rootDOMCtx, null).inject(rootAttrsCtx, {}).inject(editorViewTimerCtx, [
        EditorStateReady,
        PasteRulesReady
    ]).record(EditorViewReady);
    return async ()=>{
        await ctx.wait(InitReady);
        const root = ctx.get(rootCtx) || document.body;
        const el = typeof root === "string" ? document.querySelector(root) : root;
        ctx.update(prosePluginsCtx, (xs)=>[
                new __TURBOPACK__imported__module__$5b$project$5d2f$RiderProjects$2f$SyriaHub$2f$node_modules$2f$prosemirror$2d$state$2f$dist$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Plugin"]({
                    key,
                    view: (editorView2)=>{
                        const container = el ? createViewContainer(el, ctx) : void 0;
                        const handleDOM = ()=>{
                            if (container && el) {
                                const editor = editorView2.dom;
                                el.replaceChild(container, editor);
                                container.appendChild(editor);
                            }
                        };
                        handleDOM();
                        return {
                            destroy: ()=>{
                                if (container?.parentNode) container?.parentNode.replaceChild(editorView2.dom, container);
                                container?.remove();
                            }
                        };
                    }
                }),
                ...xs
            ]);
        await ctx.waitTimers(editorViewTimerCtx);
        const state = ctx.get(editorStateCtx);
        const options = ctx.get(editorViewOptionsCtx);
        const nodeViews = Object.fromEntries(ctx.get(nodeViewCtx));
        const markViews = Object.fromEntries(ctx.get(markViewCtx));
        const view = new __TURBOPACK__imported__module__$5b$project$5d2f$RiderProjects$2f$SyriaHub$2f$node_modules$2f$prosemirror$2d$view$2f$dist$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["EditorView"](el, {
            state,
            nodeViews,
            markViews,
            transformPasted: (slice, view2, isPlainText)=>{
                ctx.get(pasteRulesCtx).sort((a, b)=>(b.priority ?? 50) - (a.priority ?? 50)).map((rule)=>rule.run).forEach((runner)=>{
                    slice = runner(slice, view2, isPlainText);
                });
                return slice;
            },
            ...options
        });
        prepareViewDom(view.dom);
        ctx.set(editorViewCtx, view);
        ctx.done(EditorViewReady);
        return ()=>{
            view?.destroy();
            ctx.remove(rootCtx).remove(editorViewCtx).remove(editorViewOptionsCtx).remove(rootDOMCtx).remove(rootAttrsCtx).remove(editorViewTimerCtx).clearTimer(EditorViewReady);
        };
    };
};
withMeta(editorView, {
    displayName: "EditorView"
});
var EditorStatus = /* @__PURE__ */ ((EditorStatus2)=>{
    EditorStatus2["Idle"] = "Idle";
    EditorStatus2["OnCreate"] = "OnCreate";
    EditorStatus2["Created"] = "Created";
    EditorStatus2["OnDestroy"] = "OnDestroy";
    EditorStatus2["Destroyed"] = "Destroyed";
    return EditorStatus2;
})(EditorStatus || {});
class Editor {
    constructor(){
        this.#enableInspector = false;
        this.#status = "Idle";
        this.#configureList = [];
        this.#onStatusChange = ()=>void 0;
        this.#container = new __TURBOPACK__imported__module__$5b$project$5d2f$RiderProjects$2f$SyriaHub$2f$node_modules$2f40$milkdown$2f$ctx$2f$lib$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Container"]();
        this.#clock = new __TURBOPACK__imported__module__$5b$project$5d2f$RiderProjects$2f$SyriaHub$2f$node_modules$2f40$milkdown$2f$ctx$2f$lib$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Clock"]();
        this.#usrPluginStore = /* @__PURE__ */ new Map();
        this.#sysPluginStore = /* @__PURE__ */ new Map();
        this.#ctx = new __TURBOPACK__imported__module__$5b$project$5d2f$RiderProjects$2f$SyriaHub$2f$node_modules$2f40$milkdown$2f$ctx$2f$lib$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Ctx"](this.#container, this.#clock);
        this.#loadInternal = ()=>{
            const configPlugin = config(async (ctx)=>{
                await Promise.all(this.#configureList.map((fn)=>Promise.resolve(fn(ctx))));
            });
            const internalPlugins = [
                schema,
                parser,
                serializer,
                commands,
                keymap,
                pasteRule,
                editorState,
                editorView,
                init(this),
                configPlugin
            ];
            this.#prepare(internalPlugins, this.#sysPluginStore);
        };
        this.#prepare = (plugins, store)=>{
            plugins.forEach((plugin)=>{
                const ctx = this.#ctx.produce(this.#enableInspector ? plugin.meta : void 0);
                const handler = plugin(ctx);
                store.set(plugin, {
                    ctx,
                    handler,
                    cleanup: void 0
                });
            });
        };
        this.#cleanup = (plugins, remove = false)=>{
            return Promise.all([
                plugins
            ].flat().map(async (plugin)=>{
                const loader = this.#usrPluginStore.get(plugin);
                const cleanup = loader?.cleanup;
                if (remove) this.#usrPluginStore.delete(plugin);
                else this.#usrPluginStore.set(plugin, {
                    ctx: void 0,
                    handler: void 0,
                    cleanup: void 0
                });
                if (typeof cleanup === "function") return cleanup();
                return cleanup;
            }));
        };
        this.#cleanupInternal = async ()=>{
            await Promise.all([
                ...this.#sysPluginStore.entries()
            ].map(async ([_, { cleanup }])=>{
                if (typeof cleanup === "function") return cleanup();
                return cleanup;
            }));
            this.#sysPluginStore.clear();
        };
        this.#setStatus = (status)=>{
            this.#status = status;
            this.#onStatusChange(status);
        };
        this.#loadPluginInStore = (store)=>{
            return [
                ...store.entries()
            ].map(async ([key2, loader])=>{
                const { ctx, handler } = loader;
                if (!handler) return;
                const cleanup = await handler();
                store.set(key2, {
                    ctx,
                    handler,
                    cleanup
                });
            });
        };
        this.enableInspector = (enable = true)=>{
            this.#enableInspector = enable;
            return this;
        };
        this.onStatusChange = (onChange)=>{
            this.#onStatusChange = onChange;
            return this;
        };
        this.config = (configure)=>{
            this.#configureList.push(configure);
            return this;
        };
        this.removeConfig = (configure)=>{
            this.#configureList = this.#configureList.filter((x)=>x !== configure);
            return this;
        };
        this.use = (plugins)=>{
            const _plugins = [
                plugins
            ].flat();
            _plugins.flat().forEach((plugin)=>{
                this.#usrPluginStore.set(plugin, {
                    ctx: void 0,
                    handler: void 0,
                    cleanup: void 0
                });
            });
            if (this.#status === "Created") this.#prepare(_plugins, this.#usrPluginStore);
            return this;
        };
        this.remove = async (plugins)=>{
            if (this.#status === "OnCreate") {
                console.warn("[Milkdown]: You are trying to remove plugins when the editor is creating, this is not recommended, please check your code.");
                return new Promise((resolve)=>{
                    setTimeout(()=>{
                        resolve(this.remove(plugins));
                    }, 50);
                });
            }
            await this.#cleanup([
                plugins
            ].flat(), true);
            return this;
        };
        this.create = async ()=>{
            if (this.#status === "OnCreate") return this;
            if (this.#status === "Created") await this.destroy();
            this.#setStatus("OnCreate");
            this.#loadInternal();
            this.#prepare([
                ...this.#usrPluginStore.keys()
            ], this.#usrPluginStore);
            await Promise.all([
                this.#loadPluginInStore(this.#sysPluginStore),
                this.#loadPluginInStore(this.#usrPluginStore)
            ].flat());
            this.#setStatus("Created");
            return this;
        };
        this.destroy = async (clearPlugins = false)=>{
            if (this.#status === "Destroyed" || this.#status === "OnDestroy") return this;
            if (this.#status === "OnCreate") {
                return new Promise((resolve)=>{
                    setTimeout(()=>{
                        resolve(this.destroy(clearPlugins));
                    }, 50);
                });
            }
            if (clearPlugins) this.#configureList = [];
            this.#setStatus("OnDestroy");
            await this.#cleanup([
                ...this.#usrPluginStore.keys()
            ], clearPlugins);
            await this.#cleanupInternal();
            this.#setStatus("Destroyed");
            return this;
        };
        this.action = (action)=>action(this.#ctx);
        this.inspect = ()=>{
            if (!this.#enableInspector) {
                console.warn("[Milkdown]: You are trying to collect inspection when inspector is disabled, please enable inspector by `editor.enableInspector()` first.");
                return [];
            }
            return [
                ...this.#sysPluginStore.values(),
                ...this.#usrPluginStore.values()
            ].map(({ ctx })=>ctx?.inspector?.read()).filter((x)=>Boolean(x));
        };
    }
    /// Create a new editor instance.
    static make() {
        return new Editor();
    }
    #enableInspector;
    #status;
    #configureList;
    #onStatusChange;
    #container;
    #clock;
    #usrPluginStore;
    #sysPluginStore;
    #ctx;
    #loadInternal;
    #prepare;
    #cleanup;
    #cleanupInternal;
    #setStatus;
    #loadPluginInStore;
    /// Get the ctx of the editor.
    get ctx() {
        return this.#ctx;
    }
    /// Get the status of the editor.
    get status() {
        return this.#status;
    }
}
;
 //# sourceMappingURL=index.js.map
}),
"[project]/RiderProjects/SyriaHub/node_modules/@milkdown/theme-nord/lib/index.js [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "nord",
    ()=>nord
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$RiderProjects$2f$SyriaHub$2f$node_modules$2f40$milkdown$2f$core$2f$lib$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/RiderProjects/SyriaHub/node_modules/@milkdown/core/lib/index.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$RiderProjects$2f$SyriaHub$2f$node_modules$2f$clsx$2f$dist$2f$clsx$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/RiderProjects/SyriaHub/node_modules/clsx/dist/clsx.mjs [app-client] (ecmascript)");
;
;
function nord(ctx) {
    ctx.update(__TURBOPACK__imported__module__$5b$project$5d2f$RiderProjects$2f$SyriaHub$2f$node_modules$2f40$milkdown$2f$core$2f$lib$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["editorViewOptionsCtx"], (prev)=>{
        const prevClass = prev.attributes;
        return {
            ...prev,
            attributes: (state)=>{
                const attrs = typeof prevClass === "function" ? prevClass(state) : prevClass;
                return {
                    ...attrs,
                    class: (0, __TURBOPACK__imported__module__$5b$project$5d2f$RiderProjects$2f$SyriaHub$2f$node_modules$2f$clsx$2f$dist$2f$clsx$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"])("prose dark:prose-invert", attrs?.class || "", "milkdown-theme-nord")
                };
            }
        };
    });
}
;
 //# sourceMappingURL=index.js.map
}),
"[project]/RiderProjects/SyriaHub/node_modules/@milkdown/utils/node_modules/nanoid/url-alphabet/index.js [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "urlAlphabet",
    ()=>urlAlphabet
]);
const urlAlphabet = 'useandom-26T198340PX75pxJACKVERYMINDBUSHWOLF_GQZbfghjklqvwyzrict';
}),
"[project]/RiderProjects/SyriaHub/node_modules/@milkdown/utils/node_modules/nanoid/index.browser.js [app-client] (ecmascript) <locals>", ((__turbopack_context__) => {
"use strict";

/* @ts-self-types="./index.d.ts" */ __turbopack_context__.s([
    "customAlphabet",
    ()=>customAlphabet,
    "customRandom",
    ()=>customRandom,
    "nanoid",
    ()=>nanoid,
    "random",
    ()=>random
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$RiderProjects$2f$SyriaHub$2f$node_modules$2f40$milkdown$2f$utils$2f$node_modules$2f$nanoid$2f$url$2d$alphabet$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/RiderProjects/SyriaHub/node_modules/@milkdown/utils/node_modules/nanoid/url-alphabet/index.js [app-client] (ecmascript)");
;
;
let random = (bytes)=>crypto.getRandomValues(new Uint8Array(bytes));
let customRandom = (alphabet, defaultSize, getRandom)=>{
    let mask = (2 << Math.log2(alphabet.length - 1)) - 1;
    let step = -~(1.6 * mask * defaultSize / alphabet.length);
    return (size = defaultSize)=>{
        let id = '';
        while(true){
            let bytes = getRandom(step);
            let j = step | 0;
            while(j--){
                id += alphabet[bytes[j] & mask] || '';
                if (id.length >= size) return id;
            }
        }
    };
};
let customAlphabet = (alphabet, size = 21)=>customRandom(alphabet, size | 0, random);
let nanoid = (size = 21)=>{
    let id = '';
    let bytes = crypto.getRandomValues(new Uint8Array(size |= 0));
    while(size--){
        id += __TURBOPACK__imported__module__$5b$project$5d2f$RiderProjects$2f$SyriaHub$2f$node_modules$2f40$milkdown$2f$utils$2f$node_modules$2f$nanoid$2f$url$2d$alphabet$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["urlAlphabet"][bytes[size] & 63];
    }
    return id;
};
}),
"[project]/RiderProjects/SyriaHub/node_modules/@milkdown/utils/lib/index.js [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "$command",
    ()=>$command,
    "$commandAsync",
    ()=>$commandAsync,
    "$ctx",
    ()=>$ctx,
    "$inputRule",
    ()=>$inputRule,
    "$inputRuleAsync",
    ()=>$inputRuleAsync,
    "$mark",
    ()=>$mark,
    "$markAsync",
    ()=>$markAsync,
    "$markAttr",
    ()=>$markAttr,
    "$markSchema",
    ()=>$markSchema,
    "$node",
    ()=>$node,
    "$nodeAsync",
    ()=>$nodeAsync,
    "$nodeAttr",
    ()=>$nodeAttr,
    "$nodeSchema",
    ()=>$nodeSchema,
    "$pasteRule",
    ()=>$pasteRule,
    "$pasteRuleAsync",
    ()=>$pasteRuleAsync,
    "$prose",
    ()=>$prose,
    "$proseAsync",
    ()=>$proseAsync,
    "$remark",
    ()=>$remark,
    "$shortcut",
    ()=>$shortcut,
    "$shortcutAsync",
    ()=>$shortcutAsync,
    "$useKeymap",
    ()=>$useKeymap,
    "$view",
    ()=>$view,
    "$viewAsync",
    ()=>$viewAsync,
    "addTimer",
    ()=>addTimer,
    "callCommand",
    ()=>callCommand,
    "forceUpdate",
    ()=>forceUpdate,
    "getHTML",
    ()=>getHTML,
    "getMarkdown",
    ()=>getMarkdown,
    "insert",
    ()=>insert,
    "insertPos",
    ()=>insertPos,
    "markdownToSlice",
    ()=>markdownToSlice,
    "nanoid",
    ()=>nanoid,
    "outline",
    ()=>outline,
    "pipe",
    ()=>pipe,
    "replaceAll",
    ()=>replaceAll,
    "replaceRange",
    ()=>replaceRange,
    "setAttr",
    ()=>setAttr
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$RiderProjects$2f$SyriaHub$2f$node_modules$2f40$milkdown$2f$core$2f$lib$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/RiderProjects/SyriaHub/node_modules/@milkdown/core/lib/index.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$RiderProjects$2f$SyriaHub$2f$node_modules$2f40$milkdown$2f$ctx$2f$lib$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/RiderProjects/SyriaHub/node_modules/@milkdown/ctx/lib/index.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$RiderProjects$2f$SyriaHub$2f$node_modules$2f40$milkdown$2f$utils$2f$node_modules$2f$nanoid$2f$index$2e$browser$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/RiderProjects/SyriaHub/node_modules/@milkdown/utils/node_modules/nanoid/index.browser.js [app-client] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$RiderProjects$2f$SyriaHub$2f$node_modules$2f40$milkdown$2f$exception$2f$lib$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/RiderProjects/SyriaHub/node_modules/@milkdown/exception/lib/index.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$RiderProjects$2f$SyriaHub$2f$node_modules$2f$prosemirror$2d$model$2f$dist$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/RiderProjects/SyriaHub/node_modules/prosemirror-model/dist/index.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$RiderProjects$2f$SyriaHub$2f$node_modules$2f40$milkdown$2f$prose$2f$lib$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/RiderProjects/SyriaHub/node_modules/@milkdown/prose/lib/index.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$RiderProjects$2f$SyriaHub$2f$node_modules$2f$prosemirror$2d$state$2f$dist$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/RiderProjects/SyriaHub/node_modules/prosemirror-state/dist/index.js [app-client] (ecmascript)");
;
;
;
;
;
;
;
const nanoid = (0, __TURBOPACK__imported__module__$5b$project$5d2f$RiderProjects$2f$SyriaHub$2f$node_modules$2f40$milkdown$2f$utils$2f$node_modules$2f$nanoid$2f$index$2e$browser$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$locals$3e$__["customAlphabet"])("abcedfghicklmn", 10);
function addTimer(runner, injectTo, timerName) {
    const timer = (0, __TURBOPACK__imported__module__$5b$project$5d2f$RiderProjects$2f$SyriaHub$2f$node_modules$2f40$milkdown$2f$ctx$2f$lib$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["createTimer"])(timerName || nanoid());
    let doneCalled = false;
    const plugin = (ctx)=>{
        ctx.record(timer);
        ctx.update(injectTo, (x)=>x.concat(timer));
        return async ()=>{
            const done = ()=>{
                ctx.done(timer);
                doneCalled = true;
            };
            const cleanup = await runner(ctx, plugin, done);
            if (!doneCalled) ctx.done(timer);
            return ()=>{
                ctx.update(injectTo, (x)=>x.filter((y)=>y !== timer));
                ctx.clearTimer(timer);
                if (cleanup) {
                    const result = cleanup();
                    if (result && "then" in result) {
                        result.catch(console.error);
                    }
                }
            };
        };
    };
    plugin.timer = timer;
    return plugin;
}
function $command(key, cmd) {
    const cmdKey = (0, __TURBOPACK__imported__module__$5b$project$5d2f$RiderProjects$2f$SyriaHub$2f$node_modules$2f40$milkdown$2f$core$2f$lib$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["createCmdKey"])(key);
    const plugin = (ctx)=>async ()=>{
            plugin.key = cmdKey;
            await ctx.wait(__TURBOPACK__imported__module__$5b$project$5d2f$RiderProjects$2f$SyriaHub$2f$node_modules$2f40$milkdown$2f$core$2f$lib$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["CommandsReady"]);
            const command = cmd(ctx);
            ctx.get(__TURBOPACK__imported__module__$5b$project$5d2f$RiderProjects$2f$SyriaHub$2f$node_modules$2f40$milkdown$2f$core$2f$lib$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["commandsCtx"]).create(cmdKey, command);
            plugin.run = (payload)=>ctx.get(__TURBOPACK__imported__module__$5b$project$5d2f$RiderProjects$2f$SyriaHub$2f$node_modules$2f40$milkdown$2f$core$2f$lib$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["commandsCtx"]).call(key, payload);
            return ()=>{
                ctx.get(__TURBOPACK__imported__module__$5b$project$5d2f$RiderProjects$2f$SyriaHub$2f$node_modules$2f40$milkdown$2f$core$2f$lib$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["commandsCtx"]).remove(cmdKey);
            };
        };
    return plugin;
}
function $commandAsync(key, cmd, timerName) {
    const cmdKey = (0, __TURBOPACK__imported__module__$5b$project$5d2f$RiderProjects$2f$SyriaHub$2f$node_modules$2f40$milkdown$2f$core$2f$lib$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["createCmdKey"])(key);
    return addTimer(async (ctx, plugin)=>{
        await ctx.wait(__TURBOPACK__imported__module__$5b$project$5d2f$RiderProjects$2f$SyriaHub$2f$node_modules$2f40$milkdown$2f$core$2f$lib$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["CommandsReady"]);
        const command = await cmd(ctx);
        ctx.get(__TURBOPACK__imported__module__$5b$project$5d2f$RiderProjects$2f$SyriaHub$2f$node_modules$2f40$milkdown$2f$core$2f$lib$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["commandsCtx"]).create(cmdKey, command);
        plugin.run = (payload)=>ctx.get(__TURBOPACK__imported__module__$5b$project$5d2f$RiderProjects$2f$SyriaHub$2f$node_modules$2f40$milkdown$2f$core$2f$lib$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["commandsCtx"]).call(key, payload);
        plugin.key = cmdKey;
        return ()=>{
            ctx.get(__TURBOPACK__imported__module__$5b$project$5d2f$RiderProjects$2f$SyriaHub$2f$node_modules$2f40$milkdown$2f$core$2f$lib$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["commandsCtx"]).remove(cmdKey);
        };
    }, __TURBOPACK__imported__module__$5b$project$5d2f$RiderProjects$2f$SyriaHub$2f$node_modules$2f40$milkdown$2f$core$2f$lib$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["commandsTimerCtx"], timerName);
}
function $inputRule(inputRule) {
    const plugin = (ctx)=>async ()=>{
            await ctx.wait(__TURBOPACK__imported__module__$5b$project$5d2f$RiderProjects$2f$SyriaHub$2f$node_modules$2f40$milkdown$2f$core$2f$lib$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["SchemaReady"]);
            const ir = inputRule(ctx);
            ctx.update(__TURBOPACK__imported__module__$5b$project$5d2f$RiderProjects$2f$SyriaHub$2f$node_modules$2f40$milkdown$2f$core$2f$lib$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["inputRulesCtx"], (irs)=>[
                    ...irs,
                    ir
                ]);
            plugin.inputRule = ir;
            return ()=>{
                ctx.update(__TURBOPACK__imported__module__$5b$project$5d2f$RiderProjects$2f$SyriaHub$2f$node_modules$2f40$milkdown$2f$core$2f$lib$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["inputRulesCtx"], (irs)=>irs.filter((x)=>x !== ir));
            };
        };
    return plugin;
}
function $inputRuleAsync(inputRule, timerName) {
    return addTimer(async (ctx, plugin)=>{
        await ctx.wait(__TURBOPACK__imported__module__$5b$project$5d2f$RiderProjects$2f$SyriaHub$2f$node_modules$2f40$milkdown$2f$core$2f$lib$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["SchemaReady"]);
        const ir = await inputRule(ctx);
        ctx.update(__TURBOPACK__imported__module__$5b$project$5d2f$RiderProjects$2f$SyriaHub$2f$node_modules$2f40$milkdown$2f$core$2f$lib$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["inputRulesCtx"], (irs)=>[
                ...irs,
                ir
            ]);
        plugin.inputRule = ir;
        return ()=>{
            ctx.update(__TURBOPACK__imported__module__$5b$project$5d2f$RiderProjects$2f$SyriaHub$2f$node_modules$2f40$milkdown$2f$core$2f$lib$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["inputRulesCtx"], (irs)=>irs.filter((x)=>x !== ir));
        };
    }, __TURBOPACK__imported__module__$5b$project$5d2f$RiderProjects$2f$SyriaHub$2f$node_modules$2f40$milkdown$2f$core$2f$lib$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["editorStateTimerCtx"], timerName);
}
function $pasteRule(pasteRule) {
    const plugin = (ctx)=>async ()=>{
            await ctx.wait(__TURBOPACK__imported__module__$5b$project$5d2f$RiderProjects$2f$SyriaHub$2f$node_modules$2f40$milkdown$2f$core$2f$lib$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["SchemaReady"]);
            const pr = pasteRule(ctx);
            ctx.update(__TURBOPACK__imported__module__$5b$project$5d2f$RiderProjects$2f$SyriaHub$2f$node_modules$2f40$milkdown$2f$core$2f$lib$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["pasteRulesCtx"], (prs)=>[
                    ...prs,
                    pr
                ]);
            plugin.pasteRule = pr;
            return ()=>{
                ctx.update(__TURBOPACK__imported__module__$5b$project$5d2f$RiderProjects$2f$SyriaHub$2f$node_modules$2f40$milkdown$2f$core$2f$lib$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["pasteRulesCtx"], (prs)=>prs.filter((x)=>x !== pr));
            };
        };
    return plugin;
}
function $pasteRuleAsync(pasteRule, timerName) {
    return addTimer(async (ctx, plugin)=>{
        await ctx.wait(__TURBOPACK__imported__module__$5b$project$5d2f$RiderProjects$2f$SyriaHub$2f$node_modules$2f40$milkdown$2f$core$2f$lib$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["SchemaReady"]);
        const pr = await pasteRule(ctx);
        ctx.update(__TURBOPACK__imported__module__$5b$project$5d2f$RiderProjects$2f$SyriaHub$2f$node_modules$2f40$milkdown$2f$core$2f$lib$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["pasteRulesCtx"], (prs)=>[
                ...prs,
                pr
            ]);
        plugin.pasteRule = pr;
        return ()=>{
            ctx.update(__TURBOPACK__imported__module__$5b$project$5d2f$RiderProjects$2f$SyriaHub$2f$node_modules$2f40$milkdown$2f$core$2f$lib$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["pasteRulesCtx"], (prs)=>prs.filter((x)=>x !== pr));
        };
    }, __TURBOPACK__imported__module__$5b$project$5d2f$RiderProjects$2f$SyriaHub$2f$node_modules$2f40$milkdown$2f$core$2f$lib$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["pasteRulesTimerCtx"], timerName);
}
function $mark(id, schema) {
    const plugin = (ctx)=>async ()=>{
            const markSchema = schema(ctx);
            ctx.update(__TURBOPACK__imported__module__$5b$project$5d2f$RiderProjects$2f$SyriaHub$2f$node_modules$2f40$milkdown$2f$core$2f$lib$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["marksCtx"], (ns)=>[
                    ...ns.filter((n)=>n[0] !== id),
                    [
                        id,
                        markSchema
                    ]
                ]);
            plugin.id = id;
            plugin.schema = markSchema;
            return ()=>{
                ctx.update(__TURBOPACK__imported__module__$5b$project$5d2f$RiderProjects$2f$SyriaHub$2f$node_modules$2f40$milkdown$2f$core$2f$lib$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["marksCtx"], (ns)=>ns.filter(([x])=>x !== id));
            };
        };
    plugin.type = (ctx)=>{
        const markType = ctx.get(__TURBOPACK__imported__module__$5b$project$5d2f$RiderProjects$2f$SyriaHub$2f$node_modules$2f40$milkdown$2f$core$2f$lib$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["schemaCtx"]).marks[id];
        if (!markType) throw (0, __TURBOPACK__imported__module__$5b$project$5d2f$RiderProjects$2f$SyriaHub$2f$node_modules$2f40$milkdown$2f$exception$2f$lib$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["missingMarkInSchema"])(id);
        return markType;
    };
    return plugin;
}
function $markAsync(id, schema, timerName) {
    const plugin = addTimer(async (ctx, plugin2, done)=>{
        const markSchema = await schema(ctx);
        ctx.update(__TURBOPACK__imported__module__$5b$project$5d2f$RiderProjects$2f$SyriaHub$2f$node_modules$2f40$milkdown$2f$core$2f$lib$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["marksCtx"], (ns)=>[
                ...ns.filter((n)=>n[0] !== id),
                [
                    id,
                    markSchema
                ]
            ]);
        plugin2.id = id;
        plugin2.schema = markSchema;
        done();
        return ()=>{
            ctx.update(__TURBOPACK__imported__module__$5b$project$5d2f$RiderProjects$2f$SyriaHub$2f$node_modules$2f40$milkdown$2f$core$2f$lib$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["marksCtx"], (ns)=>ns.filter(([x])=>x !== id));
        };
    }, __TURBOPACK__imported__module__$5b$project$5d2f$RiderProjects$2f$SyriaHub$2f$node_modules$2f40$milkdown$2f$core$2f$lib$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["schemaTimerCtx"], timerName);
    plugin.type = (ctx)=>{
        const markType = ctx.get(__TURBOPACK__imported__module__$5b$project$5d2f$RiderProjects$2f$SyriaHub$2f$node_modules$2f40$milkdown$2f$core$2f$lib$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["schemaCtx"]).marks[id];
        if (!markType) throw (0, __TURBOPACK__imported__module__$5b$project$5d2f$RiderProjects$2f$SyriaHub$2f$node_modules$2f40$milkdown$2f$exception$2f$lib$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["missingMarkInSchema"])(id);
        return markType;
    };
    return plugin;
}
function $node(id, schema) {
    const plugin = (ctx)=>async ()=>{
            const nodeSchema = schema(ctx);
            ctx.update(__TURBOPACK__imported__module__$5b$project$5d2f$RiderProjects$2f$SyriaHub$2f$node_modules$2f40$milkdown$2f$core$2f$lib$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["nodesCtx"], (ns)=>[
                    ...ns.filter((n)=>n[0] !== id),
                    [
                        id,
                        nodeSchema
                    ]
                ]);
            plugin.id = id;
            plugin.schema = nodeSchema;
            return ()=>{
                ctx.update(__TURBOPACK__imported__module__$5b$project$5d2f$RiderProjects$2f$SyriaHub$2f$node_modules$2f40$milkdown$2f$core$2f$lib$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["nodesCtx"], (ns)=>ns.filter(([x])=>x !== id));
            };
        };
    plugin.type = (ctx)=>{
        const nodeType = ctx.get(__TURBOPACK__imported__module__$5b$project$5d2f$RiderProjects$2f$SyriaHub$2f$node_modules$2f40$milkdown$2f$core$2f$lib$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["schemaCtx"]).nodes[id];
        if (!nodeType) throw (0, __TURBOPACK__imported__module__$5b$project$5d2f$RiderProjects$2f$SyriaHub$2f$node_modules$2f40$milkdown$2f$exception$2f$lib$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["missingNodeInSchema"])(id);
        return nodeType;
    };
    return plugin;
}
function $nodeAsync(id, schema, timerName) {
    const plugin = addTimer(async (ctx, plugin2, done)=>{
        const nodeSchema = await schema(ctx);
        ctx.update(__TURBOPACK__imported__module__$5b$project$5d2f$RiderProjects$2f$SyriaHub$2f$node_modules$2f40$milkdown$2f$core$2f$lib$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["nodesCtx"], (ns)=>[
                ...ns.filter((n)=>n[0] !== id),
                [
                    id,
                    nodeSchema
                ]
            ]);
        plugin2.id = id;
        plugin2.schema = nodeSchema;
        done();
        return ()=>{
            ctx.update(__TURBOPACK__imported__module__$5b$project$5d2f$RiderProjects$2f$SyriaHub$2f$node_modules$2f40$milkdown$2f$core$2f$lib$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["nodesCtx"], (ns)=>ns.filter(([x])=>x !== id));
        };
    }, __TURBOPACK__imported__module__$5b$project$5d2f$RiderProjects$2f$SyriaHub$2f$node_modules$2f40$milkdown$2f$core$2f$lib$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["schemaTimerCtx"], timerName);
    plugin.type = (ctx)=>{
        const nodeType = ctx.get(__TURBOPACK__imported__module__$5b$project$5d2f$RiderProjects$2f$SyriaHub$2f$node_modules$2f40$milkdown$2f$core$2f$lib$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["schemaCtx"]).nodes[id];
        if (!nodeType) throw (0, __TURBOPACK__imported__module__$5b$project$5d2f$RiderProjects$2f$SyriaHub$2f$node_modules$2f40$milkdown$2f$exception$2f$lib$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["missingNodeInSchema"])(id);
        return nodeType;
    };
    return plugin;
}
function $prose(prose) {
    let prosePlugin;
    const plugin = (ctx)=>async ()=>{
            await ctx.wait(__TURBOPACK__imported__module__$5b$project$5d2f$RiderProjects$2f$SyriaHub$2f$node_modules$2f40$milkdown$2f$core$2f$lib$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["SchemaReady"]);
            prosePlugin = prose(ctx);
            ctx.update(__TURBOPACK__imported__module__$5b$project$5d2f$RiderProjects$2f$SyriaHub$2f$node_modules$2f40$milkdown$2f$core$2f$lib$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["prosePluginsCtx"], (ps)=>[
                    ...ps,
                    prosePlugin
                ]);
            return ()=>{
                ctx.update(__TURBOPACK__imported__module__$5b$project$5d2f$RiderProjects$2f$SyriaHub$2f$node_modules$2f40$milkdown$2f$core$2f$lib$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["prosePluginsCtx"], (ps)=>ps.filter((x)=>x !== prosePlugin));
            };
        };
    plugin.plugin = ()=>prosePlugin;
    plugin.key = ()=>prosePlugin.spec.key;
    return plugin;
}
function $proseAsync(prose, timerName) {
    let prosePlugin;
    const plugin = addTimer(async (ctx)=>{
        await ctx.wait(__TURBOPACK__imported__module__$5b$project$5d2f$RiderProjects$2f$SyriaHub$2f$node_modules$2f40$milkdown$2f$core$2f$lib$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["SchemaReady"]);
        prosePlugin = await prose(ctx);
        ctx.update(__TURBOPACK__imported__module__$5b$project$5d2f$RiderProjects$2f$SyriaHub$2f$node_modules$2f40$milkdown$2f$core$2f$lib$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["prosePluginsCtx"], (ps)=>[
                ...ps,
                prosePlugin
            ]);
        return ()=>{
            ctx.update(__TURBOPACK__imported__module__$5b$project$5d2f$RiderProjects$2f$SyriaHub$2f$node_modules$2f40$milkdown$2f$core$2f$lib$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["prosePluginsCtx"], (ps)=>ps.filter((x)=>x !== prosePlugin));
        };
    }, __TURBOPACK__imported__module__$5b$project$5d2f$RiderProjects$2f$SyriaHub$2f$node_modules$2f40$milkdown$2f$core$2f$lib$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["editorStateTimerCtx"], timerName);
    plugin.plugin = ()=>prosePlugin;
    plugin.key = ()=>prosePlugin.spec.key;
    return plugin;
}
function $shortcut(shortcut) {
    const plugin = (ctx)=>async ()=>{
            await ctx.wait(__TURBOPACK__imported__module__$5b$project$5d2f$RiderProjects$2f$SyriaHub$2f$node_modules$2f40$milkdown$2f$core$2f$lib$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["KeymapReady"]);
            const km = ctx.get(__TURBOPACK__imported__module__$5b$project$5d2f$RiderProjects$2f$SyriaHub$2f$node_modules$2f40$milkdown$2f$core$2f$lib$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["keymapCtx"]);
            const keymap = shortcut(ctx);
            const dispose = km.addObjectKeymap(keymap);
            plugin.keymap = keymap;
            return ()=>{
                dispose();
            };
        };
    return plugin;
}
function $shortcutAsync(shortcut, timerName) {
    return addTimer(async (ctx, plugin)=>{
        await ctx.wait(__TURBOPACK__imported__module__$5b$project$5d2f$RiderProjects$2f$SyriaHub$2f$node_modules$2f40$milkdown$2f$core$2f$lib$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["KeymapReady"]);
        const km = ctx.get(__TURBOPACK__imported__module__$5b$project$5d2f$RiderProjects$2f$SyriaHub$2f$node_modules$2f40$milkdown$2f$core$2f$lib$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["keymapCtx"]);
        const keymap = await shortcut(ctx);
        const dispose = km.addObjectKeymap(keymap);
        plugin.keymap = keymap;
        return ()=>{
            dispose();
        };
    }, __TURBOPACK__imported__module__$5b$project$5d2f$RiderProjects$2f$SyriaHub$2f$node_modules$2f40$milkdown$2f$core$2f$lib$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["editorStateTimerCtx"], timerName);
}
function $view(type, view) {
    const plugin = (ctx)=>async ()=>{
            await ctx.wait(__TURBOPACK__imported__module__$5b$project$5d2f$RiderProjects$2f$SyriaHub$2f$node_modules$2f40$milkdown$2f$core$2f$lib$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["SchemaReady"]);
            const v = view(ctx);
            if (type.type(ctx) instanceof __TURBOPACK__imported__module__$5b$project$5d2f$RiderProjects$2f$SyriaHub$2f$node_modules$2f$prosemirror$2d$model$2f$dist$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["NodeType"]) ctx.update(__TURBOPACK__imported__module__$5b$project$5d2f$RiderProjects$2f$SyriaHub$2f$node_modules$2f40$milkdown$2f$core$2f$lib$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["nodeViewCtx"], (ps)=>[
                    ...ps,
                    [
                        type.id,
                        v
                    ]
                ]);
            else ctx.update(__TURBOPACK__imported__module__$5b$project$5d2f$RiderProjects$2f$SyriaHub$2f$node_modules$2f40$milkdown$2f$core$2f$lib$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["markViewCtx"], (ps)=>[
                    ...ps,
                    [
                        type.id,
                        v
                    ]
                ]);
            plugin.view = v;
            plugin.type = type;
            return ()=>{
                if (type.type(ctx) instanceof __TURBOPACK__imported__module__$5b$project$5d2f$RiderProjects$2f$SyriaHub$2f$node_modules$2f$prosemirror$2d$model$2f$dist$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["NodeType"]) ctx.update(__TURBOPACK__imported__module__$5b$project$5d2f$RiderProjects$2f$SyriaHub$2f$node_modules$2f40$milkdown$2f$core$2f$lib$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["nodeViewCtx"], (ps)=>ps.filter((x)=>x[0] !== type.id));
                else ctx.update(__TURBOPACK__imported__module__$5b$project$5d2f$RiderProjects$2f$SyriaHub$2f$node_modules$2f40$milkdown$2f$core$2f$lib$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["markViewCtx"], (ps)=>ps.filter((x)=>x[0] !== type.id));
            };
        };
    return plugin;
}
function $viewAsync(type, view, timerName) {
    return addTimer(async (ctx, plugin)=>{
        await ctx.wait(__TURBOPACK__imported__module__$5b$project$5d2f$RiderProjects$2f$SyriaHub$2f$node_modules$2f40$milkdown$2f$core$2f$lib$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["SchemaReady"]);
        const v = await view(ctx);
        if (type.type(ctx) instanceof __TURBOPACK__imported__module__$5b$project$5d2f$RiderProjects$2f$SyriaHub$2f$node_modules$2f$prosemirror$2d$model$2f$dist$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["NodeType"]) ctx.update(__TURBOPACK__imported__module__$5b$project$5d2f$RiderProjects$2f$SyriaHub$2f$node_modules$2f40$milkdown$2f$core$2f$lib$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["nodeViewCtx"], (ps)=>[
                ...ps,
                [
                    type.id,
                    v
                ]
            ]);
        else ctx.update(__TURBOPACK__imported__module__$5b$project$5d2f$RiderProjects$2f$SyriaHub$2f$node_modules$2f40$milkdown$2f$core$2f$lib$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["markViewCtx"], (ps)=>[
                ...ps,
                [
                    type.id,
                    v
                ]
            ]);
        plugin.view = v;
        plugin.type = type;
        return ()=>{
            if (type.type(ctx) instanceof __TURBOPACK__imported__module__$5b$project$5d2f$RiderProjects$2f$SyriaHub$2f$node_modules$2f$prosemirror$2d$model$2f$dist$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["NodeType"]) ctx.update(__TURBOPACK__imported__module__$5b$project$5d2f$RiderProjects$2f$SyriaHub$2f$node_modules$2f40$milkdown$2f$core$2f$lib$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["nodeViewCtx"], (ps)=>ps.filter((x)=>x[0] !== type.id));
            else ctx.update(__TURBOPACK__imported__module__$5b$project$5d2f$RiderProjects$2f$SyriaHub$2f$node_modules$2f40$milkdown$2f$core$2f$lib$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["markViewCtx"], (ps)=>ps.filter((x)=>x[0] !== type.id));
        };
    }, __TURBOPACK__imported__module__$5b$project$5d2f$RiderProjects$2f$SyriaHub$2f$node_modules$2f40$milkdown$2f$core$2f$lib$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["editorViewTimerCtx"], timerName);
}
function $ctx(value, name) {
    const slice = (0, __TURBOPACK__imported__module__$5b$project$5d2f$RiderProjects$2f$SyriaHub$2f$node_modules$2f40$milkdown$2f$ctx$2f$lib$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["createSlice"])(value, name);
    const plugin = (ctx)=>{
        ctx.inject(slice);
        return ()=>{
            return ()=>{
                ctx.remove(slice);
            };
        };
    };
    plugin.key = slice;
    return plugin;
}
function $nodeSchema(id, schema) {
    const schemaCtx2 = $ctx(schema, id);
    const nodeSchema = $node(id, (ctx)=>{
        const userSchema = ctx.get(schemaCtx2.key);
        return userSchema(ctx);
    });
    const result = [
        schemaCtx2,
        nodeSchema
    ];
    result.id = nodeSchema.id;
    result.node = nodeSchema;
    result.type = (ctx)=>nodeSchema.type(ctx);
    result.ctx = schemaCtx2;
    result.key = schemaCtx2.key;
    result.extendSchema = (handler)=>{
        const nextSchema = handler(schema);
        return $nodeSchema(id, nextSchema);
    };
    return result;
}
function $markSchema(id, schema) {
    const schemaCtx2 = $ctx(schema, id);
    const markSchema = $mark(id, (ctx)=>{
        const userSchema = ctx.get(schemaCtx2.key);
        return userSchema(ctx);
    });
    const result = [
        schemaCtx2,
        markSchema
    ];
    result.id = markSchema.id;
    result.mark = markSchema;
    result.type = (ctx)=>markSchema.type(ctx);
    result.ctx = schemaCtx2;
    result.key = schemaCtx2.key;
    result.extendSchema = (handler)=>{
        const nextSchema = handler(schema);
        return $markSchema(id, nextSchema);
    };
    return result;
}
function $useKeymap(name, userKeymap) {
    const key = Object.fromEntries(Object.entries(userKeymap).map(([key2, { shortcuts: shortcuts2, priority }])=>{
        return [
            key2,
            {
                shortcuts: shortcuts2,
                priority
            }
        ];
    }));
    const keymapDef = $ctx(key, `${name}Keymap`);
    const shortcuts = $shortcut((ctx)=>{
        const keys = ctx.get(keymapDef.key);
        const keymapTuple = Object.entries(userKeymap).flatMap(([key2, { command }])=>{
            const target = keys[key2];
            const targetKeys = [
                target.shortcuts
            ].flat();
            const priority = target.priority;
            return targetKeys.map((targetKey)=>[
                    targetKey,
                    {
                        key: targetKey,
                        onRun: command,
                        priority
                    }
                ]);
        });
        return Object.fromEntries(keymapTuple);
    });
    const result = [
        keymapDef,
        shortcuts
    ];
    result.ctx = keymapDef;
    result.shortcuts = shortcuts;
    result.key = keymapDef.key;
    result.keymap = shortcuts.keymap;
    return result;
}
const $nodeAttr = (name, value = ()=>({}))=>$ctx(value, `${name}Attr`);
const $markAttr = (name, value = ()=>({}))=>$ctx(value, `${name}Attr`);
function $remark(id, remark, initialOptions) {
    const options = $ctx(initialOptions ?? {}, id);
    const plugin = (ctx)=>async ()=>{
            await ctx.wait(__TURBOPACK__imported__module__$5b$project$5d2f$RiderProjects$2f$SyriaHub$2f$node_modules$2f40$milkdown$2f$core$2f$lib$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["InitReady"]);
            const re = remark(ctx);
            const remarkPlugin = {
                plugin: re,
                options: ctx.get(options.key)
            };
            ctx.update(__TURBOPACK__imported__module__$5b$project$5d2f$RiderProjects$2f$SyriaHub$2f$node_modules$2f40$milkdown$2f$core$2f$lib$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["remarkPluginsCtx"], (rp)=>[
                    ...rp,
                    remarkPlugin
                ]);
            return ()=>{
                ctx.update(__TURBOPACK__imported__module__$5b$project$5d2f$RiderProjects$2f$SyriaHub$2f$node_modules$2f40$milkdown$2f$core$2f$lib$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["remarkPluginsCtx"], (rp)=>rp.filter((x)=>x !== remarkPlugin));
            };
        };
    const result = [
        options,
        plugin
    ];
    result.id = id;
    result.plugin = plugin;
    result.options = options;
    return result;
}
function callCommand(slice, payload) {
    return (ctx)=>{
        return ctx.get(__TURBOPACK__imported__module__$5b$project$5d2f$RiderProjects$2f$SyriaHub$2f$node_modules$2f40$milkdown$2f$core$2f$lib$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["commandsCtx"]).call(slice, payload);
    };
}
function forceUpdate() {
    return (ctx)=>{
        const view = ctx.get(__TURBOPACK__imported__module__$5b$project$5d2f$RiderProjects$2f$SyriaHub$2f$node_modules$2f40$milkdown$2f$core$2f$lib$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["editorViewCtx"]);
        const { tr } = view.state;
        const nextTr = Object.assign(Object.create(tr), tr).setTime(Date.now());
        return view.dispatch(nextTr);
    };
}
function getHTML() {
    return (ctx)=>{
        const div = document.createElement("div");
        const schema = ctx.get(__TURBOPACK__imported__module__$5b$project$5d2f$RiderProjects$2f$SyriaHub$2f$node_modules$2f40$milkdown$2f$core$2f$lib$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["schemaCtx"]);
        const view = ctx.get(__TURBOPACK__imported__module__$5b$project$5d2f$RiderProjects$2f$SyriaHub$2f$node_modules$2f40$milkdown$2f$core$2f$lib$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["editorViewCtx"]);
        const fragment = __TURBOPACK__imported__module__$5b$project$5d2f$RiderProjects$2f$SyriaHub$2f$node_modules$2f$prosemirror$2d$model$2f$dist$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["DOMSerializer"].fromSchema(schema).serializeFragment(view.state.doc.content);
        div.appendChild(fragment);
        return div.innerHTML;
    };
}
function getMarkdown(range) {
    return (ctx)=>{
        const view = ctx.get(__TURBOPACK__imported__module__$5b$project$5d2f$RiderProjects$2f$SyriaHub$2f$node_modules$2f40$milkdown$2f$core$2f$lib$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["editorViewCtx"]);
        const schema = ctx.get(__TURBOPACK__imported__module__$5b$project$5d2f$RiderProjects$2f$SyriaHub$2f$node_modules$2f40$milkdown$2f$core$2f$lib$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["schemaCtx"]);
        const serializer = ctx.get(__TURBOPACK__imported__module__$5b$project$5d2f$RiderProjects$2f$SyriaHub$2f$node_modules$2f40$milkdown$2f$core$2f$lib$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["serializerCtx"]);
        if (!range) {
            return serializer(view.state.doc);
        }
        const state = view.state;
        const slice = state.doc.slice(range.from, range.to, true);
        const doc = schema.topNodeType.createAndFill(null, slice.content);
        if (!doc) {
            console.error("No document found");
            return "";
        }
        return serializer(doc);
    };
}
function insert(markdown, inline = false) {
    return (ctx)=>{
        const view = ctx.get(__TURBOPACK__imported__module__$5b$project$5d2f$RiderProjects$2f$SyriaHub$2f$node_modules$2f40$milkdown$2f$core$2f$lib$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["editorViewCtx"]);
        const parser = ctx.get(__TURBOPACK__imported__module__$5b$project$5d2f$RiderProjects$2f$SyriaHub$2f$node_modules$2f40$milkdown$2f$core$2f$lib$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["parserCtx"]);
        const doc = parser(markdown);
        if (!doc) return;
        if (!inline) {
            const contentSlice = view.state.selection.content();
            return view.dispatch(view.state.tr.replaceSelection(new __TURBOPACK__imported__module__$5b$project$5d2f$RiderProjects$2f$SyriaHub$2f$node_modules$2f$prosemirror$2d$model$2f$dist$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Slice"](doc.content, contentSlice.openStart, contentSlice.openEnd)).scrollIntoView());
        }
        const schema = ctx.get(__TURBOPACK__imported__module__$5b$project$5d2f$RiderProjects$2f$SyriaHub$2f$node_modules$2f40$milkdown$2f$core$2f$lib$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["schemaCtx"]);
        const dom = __TURBOPACK__imported__module__$5b$project$5d2f$RiderProjects$2f$SyriaHub$2f$node_modules$2f$prosemirror$2d$model$2f$dist$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["DOMSerializer"].fromSchema(schema).serializeFragment(doc.content);
        const domParser = __TURBOPACK__imported__module__$5b$project$5d2f$RiderProjects$2f$SyriaHub$2f$node_modules$2f$prosemirror$2d$model$2f$dist$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["DOMParser"].fromSchema(schema);
        const slice = domParser.parseSlice(dom);
        const node = (0, __TURBOPACK__imported__module__$5b$project$5d2f$RiderProjects$2f$SyriaHub$2f$node_modules$2f40$milkdown$2f$prose$2f$lib$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["isTextOnlySlice"])(slice);
        if (node) {
            view.dispatch(view.state.tr.replaceSelectionWith(node, true));
            return;
        }
        view.dispatch(view.state.tr.replaceSelection(slice));
    };
}
function outline() {
    return (ctx)=>{
        const view = ctx.get(__TURBOPACK__imported__module__$5b$project$5d2f$RiderProjects$2f$SyriaHub$2f$node_modules$2f40$milkdown$2f$core$2f$lib$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["editorViewCtx"]);
        const data = [];
        const doc = view.state.doc;
        doc.descendants((node)=>{
            if (node.type.name === "heading" && node.attrs.level) data.push({
                text: node.textContent,
                level: node.attrs.level,
                id: node.attrs.id
            });
        });
        return data;
    };
}
function replaceAll(markdown, flush = false) {
    return (ctx)=>{
        const view = ctx.get(__TURBOPACK__imported__module__$5b$project$5d2f$RiderProjects$2f$SyriaHub$2f$node_modules$2f40$milkdown$2f$core$2f$lib$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["editorViewCtx"]);
        const parser = ctx.get(__TURBOPACK__imported__module__$5b$project$5d2f$RiderProjects$2f$SyriaHub$2f$node_modules$2f40$milkdown$2f$core$2f$lib$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["parserCtx"]);
        const doc = parser(markdown);
        if (!doc) return;
        if (!flush) {
            const { state: state2 } = view;
            return view.dispatch(state2.tr.replace(0, state2.doc.content.size, new __TURBOPACK__imported__module__$5b$project$5d2f$RiderProjects$2f$SyriaHub$2f$node_modules$2f$prosemirror$2d$model$2f$dist$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Slice"](doc.content, 0, 0)));
        }
        const schema = ctx.get(__TURBOPACK__imported__module__$5b$project$5d2f$RiderProjects$2f$SyriaHub$2f$node_modules$2f40$milkdown$2f$core$2f$lib$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["schemaCtx"]);
        const options = ctx.get(__TURBOPACK__imported__module__$5b$project$5d2f$RiderProjects$2f$SyriaHub$2f$node_modules$2f40$milkdown$2f$core$2f$lib$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["editorStateOptionsCtx"]);
        const plugins = ctx.get(__TURBOPACK__imported__module__$5b$project$5d2f$RiderProjects$2f$SyriaHub$2f$node_modules$2f40$milkdown$2f$core$2f$lib$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["prosePluginsCtx"]);
        const state = __TURBOPACK__imported__module__$5b$project$5d2f$RiderProjects$2f$SyriaHub$2f$node_modules$2f$prosemirror$2d$state$2f$dist$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["EditorState"].create({
            schema,
            doc,
            plugins,
            ...options
        });
        view.updateState(state);
    };
}
function setAttr(pos, update) {
    return (ctx)=>{
        const view = ctx.get(__TURBOPACK__imported__module__$5b$project$5d2f$RiderProjects$2f$SyriaHub$2f$node_modules$2f40$milkdown$2f$core$2f$lib$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["editorViewCtx"]);
        const { tr } = view.state;
        const node = tr.doc.nodeAt(pos);
        if (!node) return;
        const nextAttr = update(node.attrs);
        return view.dispatch(tr.setNodeMarkup(pos, void 0, nextAttr));
    };
}
function markdownToSlice(markdown) {
    return (ctx)=>{
        const parser = ctx.get(__TURBOPACK__imported__module__$5b$project$5d2f$RiderProjects$2f$SyriaHub$2f$node_modules$2f40$milkdown$2f$core$2f$lib$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["parserCtx"]);
        const doc = parser(markdown);
        const schema = ctx.get(__TURBOPACK__imported__module__$5b$project$5d2f$RiderProjects$2f$SyriaHub$2f$node_modules$2f40$milkdown$2f$core$2f$lib$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["schemaCtx"]);
        const dom = __TURBOPACK__imported__module__$5b$project$5d2f$RiderProjects$2f$SyriaHub$2f$node_modules$2f$prosemirror$2d$model$2f$dist$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["DOMSerializer"].fromSchema(schema).serializeFragment(doc.content);
        const domParser = __TURBOPACK__imported__module__$5b$project$5d2f$RiderProjects$2f$SyriaHub$2f$node_modules$2f$prosemirror$2d$model$2f$dist$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["DOMParser"].fromSchema(schema);
        const slice = domParser.parseSlice(dom);
        return slice;
    };
}
function insertPos(markdown, pos, inline = false) {
    return (ctx)=>{
        const slice = markdownToSlice(markdown)(ctx);
        const view = ctx.get(__TURBOPACK__imported__module__$5b$project$5d2f$RiderProjects$2f$SyriaHub$2f$node_modules$2f40$milkdown$2f$core$2f$lib$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["editorViewCtx"]);
        const toPos = view.state.doc.resolve(pos);
        const min = 0;
        const max = view.state.doc.content.size;
        const resolved = inline ? toPos.pos : toPos.after(toPos.depth - 1);
        const to = Math.min(Math.max(resolved, min), max);
        view.dispatch(view.state.tr.replace(resolved, to, slice));
    };
}
function replaceRange(markdown, range) {
    return (ctx)=>{
        const view = ctx.get(__TURBOPACK__imported__module__$5b$project$5d2f$RiderProjects$2f$SyriaHub$2f$node_modules$2f40$milkdown$2f$core$2f$lib$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["editorViewCtx"]);
        const slice = markdownToSlice(markdown)(ctx);
        view.dispatch(view.state.tr.replace(range.from, range.to, slice));
    };
}
const pipe = (...funcs)=>{
    const length = funcs.length;
    let index = length;
    while(index--){
        if (typeof funcs[index] !== "function") throw new TypeError("Expected a function");
    }
    return (...args)=>{
        let index2 = 0;
        let result = length ? funcs[index2](...args) : args[0];
        while(++index2 < length)result = funcs[index2](result);
        return result;
    };
};
;
 //# sourceMappingURL=index.js.map
}),
"[project]/RiderProjects/SyriaHub/node_modules/@milkdown/preset-commonmark/lib/index.js [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "addBlockTypeCommand",
    ()=>addBlockTypeCommand,
    "blockquoteAttr",
    ()=>blockquoteAttr,
    "blockquoteKeymap",
    ()=>blockquoteKeymap,
    "blockquoteSchema",
    ()=>blockquoteSchema,
    "bulletListAttr",
    ()=>bulletListAttr,
    "bulletListKeymap",
    ()=>bulletListKeymap,
    "bulletListSchema",
    ()=>bulletListSchema,
    "clearTextInCurrentBlockCommand",
    ()=>clearTextInCurrentBlockCommand,
    "codeBlockAttr",
    ()=>codeBlockAttr,
    "codeBlockKeymap",
    ()=>codeBlockKeymap,
    "codeBlockSchema",
    ()=>codeBlockSchema,
    "commands",
    ()=>commands,
    "commonmark",
    ()=>commonmark,
    "createCodeBlockCommand",
    ()=>createCodeBlockCommand,
    "createCodeBlockInputRule",
    ()=>createCodeBlockInputRule,
    "docSchema",
    ()=>docSchema,
    "downgradeHeadingCommand",
    ()=>downgradeHeadingCommand,
    "emphasisAttr",
    ()=>emphasisAttr,
    "emphasisKeymap",
    ()=>emphasisKeymap,
    "emphasisSchema",
    ()=>emphasisSchema,
    "emphasisStarInputRule",
    ()=>emphasisStarInputRule,
    "emphasisUnderscoreInputRule",
    ()=>emphasisUnderscoreInputRule,
    "hardbreakAttr",
    ()=>hardbreakAttr,
    "hardbreakClearMarkPlugin",
    ()=>hardbreakClearMarkPlugin,
    "hardbreakFilterNodes",
    ()=>hardbreakFilterNodes,
    "hardbreakFilterPlugin",
    ()=>hardbreakFilterPlugin,
    "hardbreakKeymap",
    ()=>hardbreakKeymap,
    "hardbreakSchema",
    ()=>hardbreakSchema,
    "headingAttr",
    ()=>headingAttr,
    "headingIdGenerator",
    ()=>headingIdGenerator,
    "headingKeymap",
    ()=>headingKeymap,
    "headingSchema",
    ()=>headingSchema,
    "hrAttr",
    ()=>hrAttr,
    "hrSchema",
    ()=>hrSchema,
    "htmlAttr",
    ()=>htmlAttr,
    "htmlSchema",
    ()=>htmlSchema,
    "imageAttr",
    ()=>imageAttr,
    "imageSchema",
    ()=>imageSchema,
    "inlineCodeAttr",
    ()=>inlineCodeAttr,
    "inlineCodeInputRule",
    ()=>inlineCodeInputRule,
    "inlineCodeKeymap",
    ()=>inlineCodeKeymap,
    "inlineCodeSchema",
    ()=>inlineCodeSchema,
    "inlineNodesCursorPlugin",
    ()=>inlineNodesCursorPlugin,
    "inputRules",
    ()=>inputRules,
    "insertHardbreakCommand",
    ()=>insertHardbreakCommand,
    "insertHrCommand",
    ()=>insertHrCommand,
    "insertHrInputRule",
    ()=>insertHrInputRule,
    "insertImageCommand",
    ()=>insertImageCommand,
    "insertImageInputRule",
    ()=>insertImageInputRule,
    "isMarkSelectedCommand",
    ()=>isMarkSelectedCommand,
    "isNodeSelectedCommand",
    ()=>isNodeSelectedCommand,
    "keymap",
    ()=>keymap,
    "liftFirstListItemCommand",
    ()=>liftFirstListItemCommand,
    "liftListItemCommand",
    ()=>liftListItemCommand,
    "linkAttr",
    ()=>linkAttr,
    "linkSchema",
    ()=>linkSchema,
    "listItemAttr",
    ()=>listItemAttr,
    "listItemKeymap",
    ()=>listItemKeymap,
    "listItemSchema",
    ()=>listItemSchema,
    "markInputRules",
    ()=>markInputRules,
    "orderedListAttr",
    ()=>orderedListAttr,
    "orderedListKeymap",
    ()=>orderedListKeymap,
    "orderedListSchema",
    ()=>orderedListSchema,
    "paragraphAttr",
    ()=>paragraphAttr,
    "paragraphKeymap",
    ()=>paragraphKeymap,
    "paragraphSchema",
    ()=>paragraphSchema,
    "plugins",
    ()=>plugins,
    "remarkAddOrderInListPlugin",
    ()=>remarkAddOrderInListPlugin,
    "remarkHtmlTransformer",
    ()=>remarkHtmlTransformer,
    "remarkInlineLinkPlugin",
    ()=>remarkInlineLinkPlugin,
    "remarkLineBreak",
    ()=>remarkLineBreak,
    "remarkMarker",
    ()=>remarkMarker,
    "remarkPreserveEmptyLinePlugin",
    ()=>remarkPreserveEmptyLinePlugin,
    "schema",
    ()=>schema,
    "selectTextNearPosCommand",
    ()=>selectTextNearPosCommand,
    "setBlockTypeCommand",
    ()=>setBlockTypeCommand,
    "sinkListItemCommand",
    ()=>sinkListItemCommand,
    "splitListItemCommand",
    ()=>splitListItemCommand,
    "strongAttr",
    ()=>strongAttr,
    "strongInputRule",
    ()=>strongInputRule,
    "strongKeymap",
    ()=>strongKeymap,
    "strongSchema",
    ()=>strongSchema,
    "syncHeadingIdPlugin",
    ()=>syncHeadingIdPlugin,
    "syncListOrderPlugin",
    ()=>syncListOrderPlugin,
    "textSchema",
    ()=>textSchema,
    "toggleEmphasisCommand",
    ()=>toggleEmphasisCommand,
    "toggleInlineCodeCommand",
    ()=>toggleInlineCodeCommand,
    "toggleLinkCommand",
    ()=>toggleLinkCommand,
    "toggleStrongCommand",
    ()=>toggleStrongCommand,
    "turnIntoTextCommand",
    ()=>turnIntoTextCommand,
    "updateCodeBlockLanguageCommand",
    ()=>updateCodeBlockLanguageCommand,
    "updateImageCommand",
    ()=>updateImageCommand,
    "updateLinkCommand",
    ()=>updateLinkCommand,
    "wrapInBlockTypeCommand",
    ()=>wrapInBlockTypeCommand,
    "wrapInBlockquoteCommand",
    ()=>wrapInBlockquoteCommand,
    "wrapInBlockquoteInputRule",
    ()=>wrapInBlockquoteInputRule,
    "wrapInBulletListCommand",
    ()=>wrapInBulletListCommand,
    "wrapInBulletListInputRule",
    ()=>wrapInBulletListInputRule,
    "wrapInHeadingCommand",
    ()=>wrapInHeadingCommand,
    "wrapInHeadingInputRule",
    ()=>wrapInHeadingInputRule,
    "wrapInOrderedListCommand",
    ()=>wrapInOrderedListCommand,
    "wrapInOrderedListInputRule",
    ()=>wrapInOrderedListInputRule
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$RiderProjects$2f$SyriaHub$2f$node_modules$2f40$milkdown$2f$prose$2f$lib$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/RiderProjects/SyriaHub/node_modules/@milkdown/prose/lib/index.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$RiderProjects$2f$SyriaHub$2f$node_modules$2f$prosemirror$2d$model$2f$dist$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/RiderProjects/SyriaHub/node_modules/prosemirror-model/dist/index.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$RiderProjects$2f$SyriaHub$2f$node_modules$2f$prosemirror$2d$state$2f$dist$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/RiderProjects/SyriaHub/node_modules/prosemirror-state/dist/index.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$RiderProjects$2f$SyriaHub$2f$node_modules$2f$prosemirror$2d$transform$2f$dist$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/RiderProjects/SyriaHub/node_modules/prosemirror-transform/dist/index.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$RiderProjects$2f$SyriaHub$2f$node_modules$2f40$milkdown$2f$utils$2f$lib$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/RiderProjects/SyriaHub/node_modules/@milkdown/utils/lib/index.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$RiderProjects$2f$SyriaHub$2f$node_modules$2f40$milkdown$2f$core$2f$lib$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/RiderProjects/SyriaHub/node_modules/@milkdown/core/lib/index.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$RiderProjects$2f$SyriaHub$2f$node_modules$2f$prosemirror$2d$commands$2f$dist$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/RiderProjects/SyriaHub/node_modules/prosemirror-commands/dist/index.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$RiderProjects$2f$SyriaHub$2f$node_modules$2f$unist$2d$util$2d$visit$2d$parents$2f$lib$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/RiderProjects/SyriaHub/node_modules/unist-util-visit-parents/lib/index.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$RiderProjects$2f$SyriaHub$2f$node_modules$2f40$milkdown$2f$exception$2f$lib$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/RiderProjects/SyriaHub/node_modules/@milkdown/exception/lib/index.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$RiderProjects$2f$SyriaHub$2f$node_modules$2f$prosemirror$2d$inputrules$2f$dist$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/RiderProjects/SyriaHub/node_modules/prosemirror-inputrules/dist/index.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$RiderProjects$2f$SyriaHub$2f$node_modules$2f$prosemirror$2d$schema$2d$list$2f$dist$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/RiderProjects/SyriaHub/node_modules/prosemirror-schema-list/dist/index.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$RiderProjects$2f$SyriaHub$2f$node_modules$2f$prosemirror$2d$view$2f$dist$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/RiderProjects/SyriaHub/node_modules/prosemirror-view/dist/index.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$RiderProjects$2f$SyriaHub$2f$node_modules$2f$unist$2d$util$2d$visit$2f$lib$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/RiderProjects/SyriaHub/node_modules/unist-util-visit/lib/index.js [app-client] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$RiderProjects$2f$SyriaHub$2f$node_modules$2f$remark$2d$inline$2d$links$2f$lib$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/RiderProjects/SyriaHub/node_modules/remark-inline-links/lib/index.js [app-client] (ecmascript)");
;
;
;
;
;
;
;
;
;
;
;
;
;
;
function serializeText(state, node) {
    const lastIsHardBreak = node.childCount >= 1 && node.lastChild?.type.name === "hardbreak";
    if (!lastIsHardBreak) {
        state.next(node.content);
        return;
    }
    const contentArr = [];
    node.content.forEach((n, _, i)=>{
        if (i === node.childCount - 1) return;
        contentArr.push(n);
    });
    state.next(__TURBOPACK__imported__module__$5b$project$5d2f$RiderProjects$2f$SyriaHub$2f$node_modules$2f$prosemirror$2d$model$2f$dist$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Fragment"].fromArray(contentArr));
}
function withMeta(plugin, meta) {
    Object.assign(plugin, {
        meta: {
            package: "@milkdown/preset-commonmark",
            ...meta
        }
    });
    return plugin;
}
const emphasisAttr = (0, __TURBOPACK__imported__module__$5b$project$5d2f$RiderProjects$2f$SyriaHub$2f$node_modules$2f40$milkdown$2f$utils$2f$lib$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["$markAttr"])("emphasis");
withMeta(emphasisAttr, {
    displayName: "Attr<emphasis>",
    group: "Emphasis"
});
const emphasisSchema = (0, __TURBOPACK__imported__module__$5b$project$5d2f$RiderProjects$2f$SyriaHub$2f$node_modules$2f40$milkdown$2f$utils$2f$lib$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["$markSchema"])("emphasis", (ctx)=>({
        attrs: {
            marker: {
                default: ctx.get(__TURBOPACK__imported__module__$5b$project$5d2f$RiderProjects$2f$SyriaHub$2f$node_modules$2f40$milkdown$2f$core$2f$lib$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["remarkStringifyOptionsCtx"]).emphasis || "*",
                validate: "string"
            }
        },
        parseDOM: [
            {
                tag: "i"
            },
            {
                tag: "em"
            },
            {
                style: "font-style",
                getAttrs: (value)=>value === "italic"
            }
        ],
        toDOM: (mark)=>[
                "em",
                ctx.get(emphasisAttr.key)(mark)
            ],
        parseMarkdown: {
            match: (node)=>node.type === "emphasis",
            runner: (state, node, markType)=>{
                state.openMark(markType, {
                    marker: node.marker
                });
                state.next(node.children);
                state.closeMark(markType);
            }
        },
        toMarkdown: {
            match: (mark)=>mark.type.name === "emphasis",
            runner: (state, mark)=>{
                state.withMark(mark, "emphasis", void 0, {
                    marker: mark.attrs.marker
                });
            }
        }
    }));
withMeta(emphasisSchema.mark, {
    displayName: "MarkSchema<emphasis>",
    group: "Emphasis"
});
withMeta(emphasisSchema.ctx, {
    displayName: "MarkSchemaCtx<emphasis>",
    group: "Emphasis"
});
const toggleEmphasisCommand = (0, __TURBOPACK__imported__module__$5b$project$5d2f$RiderProjects$2f$SyriaHub$2f$node_modules$2f40$milkdown$2f$utils$2f$lib$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["$command"])("ToggleEmphasis", (ctx)=>()=>{
        return (0, __TURBOPACK__imported__module__$5b$project$5d2f$RiderProjects$2f$SyriaHub$2f$node_modules$2f$prosemirror$2d$commands$2f$dist$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["toggleMark"])(emphasisSchema.type(ctx));
    });
withMeta(toggleEmphasisCommand, {
    displayName: "Command<toggleEmphasisCommand>",
    group: "Emphasis"
});
const emphasisStarInputRule = (0, __TURBOPACK__imported__module__$5b$project$5d2f$RiderProjects$2f$SyriaHub$2f$node_modules$2f40$milkdown$2f$utils$2f$lib$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["$inputRule"])((ctx)=>{
    return (0, __TURBOPACK__imported__module__$5b$project$5d2f$RiderProjects$2f$SyriaHub$2f$node_modules$2f40$milkdown$2f$prose$2f$lib$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["markRule"])(/(?:^|[^*])\*([^*]+)\*$/, emphasisSchema.type(ctx), {
        getAttr: ()=>({
                marker: "*"
            }),
        updateCaptured: ({ fullMatch, start })=>!fullMatch.startsWith("*") ? {
                fullMatch: fullMatch.slice(1),
                start: start + 1
            } : {}
    });
});
withMeta(emphasisStarInputRule, {
    displayName: "InputRule<emphasis>|Star",
    group: "Emphasis"
});
const emphasisUnderscoreInputRule = (0, __TURBOPACK__imported__module__$5b$project$5d2f$RiderProjects$2f$SyriaHub$2f$node_modules$2f40$milkdown$2f$utils$2f$lib$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["$inputRule"])((ctx)=>{
    return (0, __TURBOPACK__imported__module__$5b$project$5d2f$RiderProjects$2f$SyriaHub$2f$node_modules$2f40$milkdown$2f$prose$2f$lib$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["markRule"])(/\b_(?![_\s])(.*?[^_\s])_\b/, emphasisSchema.type(ctx), {
        getAttr: ()=>({
                marker: "_"
            }),
        updateCaptured: ({ fullMatch, start })=>!fullMatch.startsWith("_") ? {
                fullMatch: fullMatch.slice(1),
                start: start + 1
            } : {}
    });
});
withMeta(emphasisUnderscoreInputRule, {
    displayName: "InputRule<emphasis>|Underscore",
    group: "Emphasis"
});
const emphasisKeymap = (0, __TURBOPACK__imported__module__$5b$project$5d2f$RiderProjects$2f$SyriaHub$2f$node_modules$2f40$milkdown$2f$utils$2f$lib$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["$useKeymap"])("emphasisKeymap", {
    ToggleEmphasis: {
        shortcuts: "Mod-i",
        command: (ctx)=>{
            const commands2 = ctx.get(__TURBOPACK__imported__module__$5b$project$5d2f$RiderProjects$2f$SyriaHub$2f$node_modules$2f40$milkdown$2f$core$2f$lib$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["commandsCtx"]);
            return ()=>commands2.call(toggleEmphasisCommand.key);
        }
    }
});
withMeta(emphasisKeymap.ctx, {
    displayName: "KeymapCtx<emphasis>",
    group: "Emphasis"
});
withMeta(emphasisKeymap.shortcuts, {
    displayName: "Keymap<emphasis>",
    group: "Emphasis"
});
const strongAttr = (0, __TURBOPACK__imported__module__$5b$project$5d2f$RiderProjects$2f$SyriaHub$2f$node_modules$2f40$milkdown$2f$utils$2f$lib$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["$markAttr"])("strong");
withMeta(strongAttr, {
    displayName: "Attr<strong>",
    group: "Strong"
});
const strongSchema = (0, __TURBOPACK__imported__module__$5b$project$5d2f$RiderProjects$2f$SyriaHub$2f$node_modules$2f40$milkdown$2f$utils$2f$lib$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["$markSchema"])("strong", (ctx)=>({
        attrs: {
            marker: {
                default: ctx.get(__TURBOPACK__imported__module__$5b$project$5d2f$RiderProjects$2f$SyriaHub$2f$node_modules$2f40$milkdown$2f$core$2f$lib$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["remarkStringifyOptionsCtx"]).strong || "*",
                validate: "string"
            }
        },
        parseDOM: [
            // This works around a Google Docs misbehavior where
            // pasted content will be inexplicably wrapped in `<b>`
            // tags with a font-weight normal.
            {
                tag: "b",
                getAttrs: (node)=>node.style.fontWeight != "normal" && null
            },
            {
                tag: "strong"
            },
            {
                style: "font-style",
                getAttrs: (value)=>value === "bold"
            },
            {
                style: "font-weight=400",
                clearMark: (m)=>m.type.name == "strong"
            },
            {
                style: "font-weight",
                getAttrs: (value)=>/^(bold(er)?|[5-9]\d{2,})$/.test(value) && null
            }
        ],
        toDOM: (mark)=>[
                "strong",
                ctx.get(strongAttr.key)(mark)
            ],
        parseMarkdown: {
            match: (node)=>node.type === "strong",
            runner: (state, node, markType)=>{
                state.openMark(markType, {
                    marker: node.marker
                });
                state.next(node.children);
                state.closeMark(markType);
            }
        },
        toMarkdown: {
            match: (mark)=>mark.type.name === "strong",
            runner: (state, mark)=>{
                state.withMark(mark, "strong", void 0, {
                    marker: mark.attrs.marker
                });
            }
        }
    }));
withMeta(strongSchema.mark, {
    displayName: "MarkSchema<strong>",
    group: "Strong"
});
withMeta(strongSchema.ctx, {
    displayName: "MarkSchemaCtx<strong>",
    group: "Strong"
});
const toggleStrongCommand = (0, __TURBOPACK__imported__module__$5b$project$5d2f$RiderProjects$2f$SyriaHub$2f$node_modules$2f40$milkdown$2f$utils$2f$lib$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["$command"])("ToggleStrong", (ctx)=>()=>{
        return (0, __TURBOPACK__imported__module__$5b$project$5d2f$RiderProjects$2f$SyriaHub$2f$node_modules$2f$prosemirror$2d$commands$2f$dist$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["toggleMark"])(strongSchema.type(ctx));
    });
withMeta(toggleStrongCommand, {
    displayName: "Command<toggleStrongCommand>",
    group: "Strong"
});
const strongInputRule = (0, __TURBOPACK__imported__module__$5b$project$5d2f$RiderProjects$2f$SyriaHub$2f$node_modules$2f40$milkdown$2f$utils$2f$lib$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["$inputRule"])((ctx)=>{
    return (0, __TURBOPACK__imported__module__$5b$project$5d2f$RiderProjects$2f$SyriaHub$2f$node_modules$2f40$milkdown$2f$prose$2f$lib$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["markRule"])(new RegExp("(?<![\\w:/])(?:\\*\\*|__)([^*_]+?)(?:\\*\\*|__)(?![\\w/])$"), strongSchema.type(ctx), {
        getAttr: (match)=>{
            return {
                marker: match[0].startsWith("*") ? "*" : "_"
            };
        }
    });
});
withMeta(strongInputRule, {
    displayName: "InputRule<strong>",
    group: "Strong"
});
const strongKeymap = (0, __TURBOPACK__imported__module__$5b$project$5d2f$RiderProjects$2f$SyriaHub$2f$node_modules$2f40$milkdown$2f$utils$2f$lib$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["$useKeymap"])("strongKeymap", {
    ToggleBold: {
        shortcuts: [
            "Mod-b"
        ],
        command: (ctx)=>{
            const commands2 = ctx.get(__TURBOPACK__imported__module__$5b$project$5d2f$RiderProjects$2f$SyriaHub$2f$node_modules$2f40$milkdown$2f$core$2f$lib$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["commandsCtx"]);
            return ()=>commands2.call(toggleStrongCommand.key);
        }
    }
});
withMeta(strongKeymap.ctx, {
    displayName: "KeymapCtx<strong>",
    group: "Strong"
});
withMeta(strongKeymap.shortcuts, {
    displayName: "Keymap<strong>",
    group: "Strong"
});
const inlineCodeAttr = (0, __TURBOPACK__imported__module__$5b$project$5d2f$RiderProjects$2f$SyriaHub$2f$node_modules$2f40$milkdown$2f$utils$2f$lib$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["$markAttr"])("inlineCode");
withMeta(inlineCodeAttr, {
    displayName: "Attr<inlineCode>",
    group: "InlineCode"
});
const inlineCodeSchema = (0, __TURBOPACK__imported__module__$5b$project$5d2f$RiderProjects$2f$SyriaHub$2f$node_modules$2f40$milkdown$2f$utils$2f$lib$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["$markSchema"])("inlineCode", (ctx)=>({
        priority: 100,
        code: true,
        parseDOM: [
            {
                tag: "code"
            }
        ],
        toDOM: (mark)=>[
                "code",
                ctx.get(inlineCodeAttr.key)(mark)
            ],
        parseMarkdown: {
            match: (node)=>node.type === "inlineCode",
            runner: (state, node, markType)=>{
                state.openMark(markType);
                state.addText(node.value);
                state.closeMark(markType);
            }
        },
        toMarkdown: {
            match: (mark)=>mark.type.name === "inlineCode",
            runner: (state, mark, node)=>{
                state.withMark(mark, "inlineCode", node.text || "");
            }
        }
    }));
withMeta(inlineCodeSchema.mark, {
    displayName: "MarkSchema<inlineCode>",
    group: "InlineCode"
});
withMeta(inlineCodeSchema.ctx, {
    displayName: "MarkSchemaCtx<inlineCode>",
    group: "InlineCode"
});
const toggleInlineCodeCommand = (0, __TURBOPACK__imported__module__$5b$project$5d2f$RiderProjects$2f$SyriaHub$2f$node_modules$2f40$milkdown$2f$utils$2f$lib$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["$command"])("ToggleInlineCode", (ctx)=>()=>(state, dispatch)=>{
            const { selection, tr } = state;
            if (selection.empty) return false;
            const { from, to } = selection;
            const has = state.doc.rangeHasMark(from, to, inlineCodeSchema.type(ctx));
            if (has) {
                dispatch?.(tr.removeMark(from, to, inlineCodeSchema.type(ctx)));
                return true;
            }
            const restMarksName = Object.keys(state.schema.marks).filter((x)=>x !== inlineCodeSchema.type.name);
            restMarksName.map((name)=>state.schema.marks[name]).forEach((t)=>{
                tr.removeMark(from, to, t);
            });
            dispatch?.(tr.addMark(from, to, inlineCodeSchema.type(ctx).create()));
            return true;
        });
withMeta(toggleInlineCodeCommand, {
    displayName: "Command<toggleInlineCodeCommand>",
    group: "InlineCode"
});
const inlineCodeInputRule = (0, __TURBOPACK__imported__module__$5b$project$5d2f$RiderProjects$2f$SyriaHub$2f$node_modules$2f40$milkdown$2f$utils$2f$lib$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["$inputRule"])((ctx)=>{
    return (0, __TURBOPACK__imported__module__$5b$project$5d2f$RiderProjects$2f$SyriaHub$2f$node_modules$2f40$milkdown$2f$prose$2f$lib$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["markRule"])(/(?:`)([^`]+)(?:`)$/, inlineCodeSchema.type(ctx));
});
withMeta(inlineCodeInputRule, {
    displayName: "InputRule<inlineCodeInputRule>",
    group: "InlineCode"
});
const inlineCodeKeymap = (0, __TURBOPACK__imported__module__$5b$project$5d2f$RiderProjects$2f$SyriaHub$2f$node_modules$2f40$milkdown$2f$utils$2f$lib$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["$useKeymap"])("inlineCodeKeymap", {
    ToggleInlineCode: {
        shortcuts: "Mod-e",
        command: (ctx)=>{
            const commands2 = ctx.get(__TURBOPACK__imported__module__$5b$project$5d2f$RiderProjects$2f$SyriaHub$2f$node_modules$2f40$milkdown$2f$core$2f$lib$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["commandsCtx"]);
            return ()=>commands2.call(toggleInlineCodeCommand.key);
        }
    }
});
withMeta(inlineCodeKeymap.ctx, {
    displayName: "KeymapCtx<inlineCode>",
    group: "InlineCode"
});
withMeta(inlineCodeKeymap.shortcuts, {
    displayName: "Keymap<inlineCode>",
    group: "InlineCode"
});
const linkAttr = (0, __TURBOPACK__imported__module__$5b$project$5d2f$RiderProjects$2f$SyriaHub$2f$node_modules$2f40$milkdown$2f$utils$2f$lib$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["$markAttr"])("link");
withMeta(linkAttr, {
    displayName: "Attr<link>",
    group: "Link"
});
const linkSchema = (0, __TURBOPACK__imported__module__$5b$project$5d2f$RiderProjects$2f$SyriaHub$2f$node_modules$2f40$milkdown$2f$utils$2f$lib$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["$markSchema"])("link", (ctx)=>({
        attrs: {
            href: {
                validate: "string"
            },
            title: {
                default: null,
                validate: "string|null"
            }
        },
        parseDOM: [
            {
                tag: "a[href]",
                getAttrs: (dom)=>{
                    if (!(dom instanceof HTMLElement)) throw (0, __TURBOPACK__imported__module__$5b$project$5d2f$RiderProjects$2f$SyriaHub$2f$node_modules$2f40$milkdown$2f$exception$2f$lib$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["expectDomTypeError"])(dom);
                    return {
                        href: dom.getAttribute("href"),
                        title: dom.getAttribute("title")
                    };
                }
            }
        ],
        toDOM: (mark)=>[
                "a",
                {
                    ...ctx.get(linkAttr.key)(mark),
                    ...mark.attrs
                }
            ],
        parseMarkdown: {
            match: (node)=>node.type === "link",
            runner: (state, node, markType)=>{
                const url = node.url;
                const title = node.title;
                state.openMark(markType, {
                    href: url,
                    title
                });
                state.next(node.children);
                state.closeMark(markType);
            }
        },
        toMarkdown: {
            match: (mark)=>mark.type.name === "link",
            runner: (state, mark)=>{
                state.withMark(mark, "link", void 0, {
                    title: mark.attrs.title,
                    url: mark.attrs.href
                });
            }
        }
    }));
withMeta(linkSchema.mark, {
    displayName: "MarkSchema<link>",
    group: "Link"
});
const toggleLinkCommand = (0, __TURBOPACK__imported__module__$5b$project$5d2f$RiderProjects$2f$SyriaHub$2f$node_modules$2f40$milkdown$2f$utils$2f$lib$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["$command"])("ToggleLink", (ctx)=>(payload = {})=>(0, __TURBOPACK__imported__module__$5b$project$5d2f$RiderProjects$2f$SyriaHub$2f$node_modules$2f$prosemirror$2d$commands$2f$dist$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["toggleMark"])(linkSchema.type(ctx), payload));
withMeta(toggleLinkCommand, {
    displayName: "Command<toggleLinkCommand>",
    group: "Link"
});
const updateLinkCommand = (0, __TURBOPACK__imported__module__$5b$project$5d2f$RiderProjects$2f$SyriaHub$2f$node_modules$2f40$milkdown$2f$utils$2f$lib$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["$command"])("UpdateLink", (ctx)=>(payload = {})=>(state, dispatch)=>{
            if (!dispatch) return false;
            let node;
            let pos = -1;
            const { selection } = state;
            const { from, to } = selection;
            state.doc.nodesBetween(from, from === to ? to + 1 : to, (n, p)=>{
                if (linkSchema.type(ctx).isInSet(n.marks)) {
                    node = n;
                    pos = p;
                    return false;
                }
                return void 0;
            });
            if (!node) return false;
            const mark = node.marks.find(({ type })=>type === linkSchema.type(ctx));
            if (!mark) return false;
            const start = pos;
            const end = pos + node.nodeSize;
            const { tr } = state;
            const linkMark = linkSchema.type(ctx).create({
                ...mark.attrs,
                ...payload
            });
            if (!linkMark) return false;
            dispatch(tr.removeMark(start, end, mark).addMark(start, end, linkMark).setSelection(new __TURBOPACK__imported__module__$5b$project$5d2f$RiderProjects$2f$SyriaHub$2f$node_modules$2f$prosemirror$2d$state$2f$dist$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["TextSelection"](tr.selection.$anchor)).scrollIntoView());
            return true;
        });
withMeta(updateLinkCommand, {
    displayName: "Command<updateLinkCommand>",
    group: "Link"
});
const docSchema = (0, __TURBOPACK__imported__module__$5b$project$5d2f$RiderProjects$2f$SyriaHub$2f$node_modules$2f40$milkdown$2f$utils$2f$lib$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["$node"])("doc", ()=>({
        content: "block+",
        parseMarkdown: {
            match: ({ type })=>type === "root",
            runner: (state, node, type)=>{
                state.injectRoot(node, type);
            }
        },
        toMarkdown: {
            match: (node)=>node.type.name === "doc",
            runner: (state, node)=>{
                state.openNode("root");
                state.next(node.content);
            }
        }
    }));
withMeta(docSchema, {
    displayName: "NodeSchema<doc>",
    group: "Doc"
});
function visitEmptyLine(ast) {
    return (0, __TURBOPACK__imported__module__$5b$project$5d2f$RiderProjects$2f$SyriaHub$2f$node_modules$2f$unist$2d$util$2d$visit$2d$parents$2f$lib$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["visitParents"])(ast, (node)=>node.type === "html" && [
            "<br />",
            "<br>",
            "<br >",
            "<br/>"
        ].includes(node.value?.trim()), (node, parents)=>{
        if (!parents.length) return;
        const parent = parents[parents.length - 1];
        if (!parent) return;
        const index = parent.children.indexOf(node);
        if (index === -1) return;
        parent.children.splice(index, 1);
    }, true);
}
const remarkPreserveEmptyLinePlugin = (0, __TURBOPACK__imported__module__$5b$project$5d2f$RiderProjects$2f$SyriaHub$2f$node_modules$2f40$milkdown$2f$utils$2f$lib$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["$remark"])("remark-preserve-empty-line", ()=>()=>visitEmptyLine);
withMeta(remarkPreserveEmptyLinePlugin.plugin, {
    displayName: "Remark<remarkPreserveEmptyLine>",
    group: "Remark"
});
withMeta(remarkPreserveEmptyLinePlugin.options, {
    displayName: "RemarkConfig<remarkPreserveEmptyLine>",
    group: "Remark"
});
const paragraphAttr = (0, __TURBOPACK__imported__module__$5b$project$5d2f$RiderProjects$2f$SyriaHub$2f$node_modules$2f40$milkdown$2f$utils$2f$lib$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["$nodeAttr"])("paragraph");
withMeta(paragraphAttr, {
    displayName: "Attr<paragraph>",
    group: "Paragraph"
});
const paragraphSchema = (0, __TURBOPACK__imported__module__$5b$project$5d2f$RiderProjects$2f$SyriaHub$2f$node_modules$2f40$milkdown$2f$utils$2f$lib$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["$nodeSchema"])("paragraph", (ctx)=>({
        content: "inline*",
        group: "block",
        parseDOM: [
            {
                tag: "p"
            }
        ],
        toDOM: (node)=>[
                "p",
                ctx.get(paragraphAttr.key)(node),
                0
            ],
        parseMarkdown: {
            match: (node)=>node.type === "paragraph",
            runner: (state, node, type)=>{
                state.openNode(type);
                if (node.children) state.next(node.children);
                else state.addText(node.value || "");
                state.closeNode();
            }
        },
        toMarkdown: {
            match: (node)=>node.type.name === "paragraph",
            runner: (state, node)=>{
                const view = ctx.get(__TURBOPACK__imported__module__$5b$project$5d2f$RiderProjects$2f$SyriaHub$2f$node_modules$2f40$milkdown$2f$core$2f$lib$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["editorViewCtx"]);
                const lastNode = view.state?.doc.lastChild;
                state.openNode("paragraph");
                if ((!node.content || node.content.size === 0) && node !== lastNode && shouldPreserveEmptyLine(ctx)) {
                    state.addNode("html", void 0, "<br />");
                } else {
                    serializeText(state, node);
                }
                state.closeNode();
            }
        }
    }));
function shouldPreserveEmptyLine(ctx) {
    let shouldPreserveEmptyLine2 = false;
    try {
        ctx.get(remarkPreserveEmptyLinePlugin.id);
        shouldPreserveEmptyLine2 = true;
    } catch  {
        shouldPreserveEmptyLine2 = false;
    }
    return shouldPreserveEmptyLine2;
}
withMeta(paragraphSchema.node, {
    displayName: "NodeSchema<paragraph>",
    group: "Paragraph"
});
withMeta(paragraphSchema.ctx, {
    displayName: "NodeSchemaCtx<paragraph>",
    group: "Paragraph"
});
const turnIntoTextCommand = (0, __TURBOPACK__imported__module__$5b$project$5d2f$RiderProjects$2f$SyriaHub$2f$node_modules$2f40$milkdown$2f$utils$2f$lib$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["$command"])("TurnIntoText", (ctx)=>()=>(0, __TURBOPACK__imported__module__$5b$project$5d2f$RiderProjects$2f$SyriaHub$2f$node_modules$2f$prosemirror$2d$commands$2f$dist$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["setBlockType"])(paragraphSchema.type(ctx)));
withMeta(turnIntoTextCommand, {
    displayName: "Command<turnIntoTextCommand>",
    group: "Paragraph"
});
const paragraphKeymap = (0, __TURBOPACK__imported__module__$5b$project$5d2f$RiderProjects$2f$SyriaHub$2f$node_modules$2f40$milkdown$2f$utils$2f$lib$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["$useKeymap"])("paragraphKeymap", {
    TurnIntoText: {
        shortcuts: "Mod-Alt-0",
        command: (ctx)=>{
            const commands2 = ctx.get(__TURBOPACK__imported__module__$5b$project$5d2f$RiderProjects$2f$SyriaHub$2f$node_modules$2f40$milkdown$2f$core$2f$lib$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["commandsCtx"]);
            return ()=>commands2.call(turnIntoTextCommand.key);
        }
    }
});
withMeta(paragraphKeymap.ctx, {
    displayName: "KeymapCtx<paragraph>",
    group: "Paragraph"
});
withMeta(paragraphKeymap.shortcuts, {
    displayName: "Keymap<paragraph>",
    group: "Paragraph"
});
const headingIndex = Array(6).fill(0).map((_, i)=>i + 1);
function defaultHeadingIdGenerator(node) {
    return node.textContent.toLowerCase().trim().replace(/\s+/g, "-");
}
const headingIdGenerator = (0, __TURBOPACK__imported__module__$5b$project$5d2f$RiderProjects$2f$SyriaHub$2f$node_modules$2f40$milkdown$2f$utils$2f$lib$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["$ctx"])(defaultHeadingIdGenerator, "headingIdGenerator");
withMeta(headingIdGenerator, {
    displayName: "Ctx<HeadingIdGenerator>",
    group: "Heading"
});
const headingAttr = (0, __TURBOPACK__imported__module__$5b$project$5d2f$RiderProjects$2f$SyriaHub$2f$node_modules$2f40$milkdown$2f$utils$2f$lib$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["$nodeAttr"])("heading");
withMeta(headingAttr, {
    displayName: "Attr<heading>",
    group: "Heading"
});
const headingSchema = (0, __TURBOPACK__imported__module__$5b$project$5d2f$RiderProjects$2f$SyriaHub$2f$node_modules$2f40$milkdown$2f$utils$2f$lib$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["$nodeSchema"])("heading", (ctx)=>{
    const getId = ctx.get(headingIdGenerator.key);
    return {
        content: "inline*",
        group: "block",
        defining: true,
        attrs: {
            id: {
                default: "",
                validate: "string"
            },
            level: {
                default: 1,
                validate: "number"
            }
        },
        parseDOM: headingIndex.map((x)=>({
                tag: `h${x}`,
                getAttrs: (node)=>{
                    if (!(node instanceof HTMLElement)) throw (0, __TURBOPACK__imported__module__$5b$project$5d2f$RiderProjects$2f$SyriaHub$2f$node_modules$2f40$milkdown$2f$exception$2f$lib$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["expectDomTypeError"])(node);
                    return {
                        level: x,
                        id: node.id
                    };
                }
            })),
        toDOM: (node)=>{
            return [
                `h${node.attrs.level}`,
                {
                    ...ctx.get(headingAttr.key)(node),
                    id: node.attrs.id || getId(node)
                },
                0
            ];
        },
        parseMarkdown: {
            match: ({ type })=>type === "heading",
            runner: (state, node, type)=>{
                const depth = node.depth;
                state.openNode(type, {
                    level: depth
                });
                state.next(node.children);
                state.closeNode();
            }
        },
        toMarkdown: {
            match: (node)=>node.type.name === "heading",
            runner: (state, node)=>{
                state.openNode("heading", void 0, {
                    depth: node.attrs.level
                });
                serializeText(state, node);
                state.closeNode();
            }
        }
    };
});
withMeta(headingSchema.node, {
    displayName: "NodeSchema<heading>",
    group: "Heading"
});
withMeta(headingSchema.ctx, {
    displayName: "NodeSchemaCtx<heading>",
    group: "Heading"
});
const wrapInHeadingInputRule = (0, __TURBOPACK__imported__module__$5b$project$5d2f$RiderProjects$2f$SyriaHub$2f$node_modules$2f40$milkdown$2f$utils$2f$lib$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["$inputRule"])((ctx)=>{
    return (0, __TURBOPACK__imported__module__$5b$project$5d2f$RiderProjects$2f$SyriaHub$2f$node_modules$2f$prosemirror$2d$inputrules$2f$dist$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["textblockTypeInputRule"])(/^(?<hashes>#+)\s$/, headingSchema.type(ctx), (match)=>{
        const x = match.groups?.hashes?.length || 0;
        const view = ctx.get(__TURBOPACK__imported__module__$5b$project$5d2f$RiderProjects$2f$SyriaHub$2f$node_modules$2f40$milkdown$2f$core$2f$lib$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["editorViewCtx"]);
        const { $from } = view.state.selection;
        const node = $from.node();
        if (node.type.name === "heading") {
            let level = Number(node.attrs.level) + Number(x);
            if (level > 6) level = 6;
            return {
                level
            };
        }
        return {
            level: x
        };
    });
});
withMeta(wrapInHeadingInputRule, {
    displayName: "InputRule<wrapInHeadingInputRule>",
    group: "Heading"
});
const wrapInHeadingCommand = (0, __TURBOPACK__imported__module__$5b$project$5d2f$RiderProjects$2f$SyriaHub$2f$node_modules$2f40$milkdown$2f$utils$2f$lib$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["$command"])("WrapInHeading", (ctx)=>{
    return (level)=>{
        level ??= 1;
        if (level < 1) return (0, __TURBOPACK__imported__module__$5b$project$5d2f$RiderProjects$2f$SyriaHub$2f$node_modules$2f$prosemirror$2d$commands$2f$dist$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["setBlockType"])(paragraphSchema.type(ctx));
        return (0, __TURBOPACK__imported__module__$5b$project$5d2f$RiderProjects$2f$SyriaHub$2f$node_modules$2f$prosemirror$2d$commands$2f$dist$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["setBlockType"])(headingSchema.type(ctx), {
            level
        });
    };
});
withMeta(wrapInHeadingCommand, {
    displayName: "Command<wrapInHeadingCommand>",
    group: "Heading"
});
const downgradeHeadingCommand = (0, __TURBOPACK__imported__module__$5b$project$5d2f$RiderProjects$2f$SyriaHub$2f$node_modules$2f40$milkdown$2f$utils$2f$lib$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["$command"])("DowngradeHeading", (ctx)=>()=>(state, dispatch, view)=>{
            const { $from } = state.selection;
            const node = $from.node();
            if (node.type !== headingSchema.type(ctx) || !state.selection.empty || $from.parentOffset !== 0) return false;
            const level = node.attrs.level - 1;
            if (!level) return (0, __TURBOPACK__imported__module__$5b$project$5d2f$RiderProjects$2f$SyriaHub$2f$node_modules$2f$prosemirror$2d$commands$2f$dist$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["setBlockType"])(paragraphSchema.type(ctx))(state, dispatch, view);
            dispatch?.(state.tr.setNodeMarkup(state.selection.$from.before(), void 0, {
                ...node.attrs,
                level
            }));
            return true;
        });
withMeta(downgradeHeadingCommand, {
    displayName: "Command<downgradeHeadingCommand>",
    group: "Heading"
});
const headingKeymap = (0, __TURBOPACK__imported__module__$5b$project$5d2f$RiderProjects$2f$SyriaHub$2f$node_modules$2f40$milkdown$2f$utils$2f$lib$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["$useKeymap"])("headingKeymap", {
    TurnIntoH1: {
        shortcuts: "Mod-Alt-1",
        command: (ctx)=>{
            const commands2 = ctx.get(__TURBOPACK__imported__module__$5b$project$5d2f$RiderProjects$2f$SyriaHub$2f$node_modules$2f40$milkdown$2f$core$2f$lib$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["commandsCtx"]);
            return ()=>commands2.call(wrapInHeadingCommand.key, 1);
        }
    },
    TurnIntoH2: {
        shortcuts: "Mod-Alt-2",
        command: (ctx)=>{
            const commands2 = ctx.get(__TURBOPACK__imported__module__$5b$project$5d2f$RiderProjects$2f$SyriaHub$2f$node_modules$2f40$milkdown$2f$core$2f$lib$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["commandsCtx"]);
            return ()=>commands2.call(wrapInHeadingCommand.key, 2);
        }
    },
    TurnIntoH3: {
        shortcuts: "Mod-Alt-3",
        command: (ctx)=>{
            const commands2 = ctx.get(__TURBOPACK__imported__module__$5b$project$5d2f$RiderProjects$2f$SyriaHub$2f$node_modules$2f40$milkdown$2f$core$2f$lib$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["commandsCtx"]);
            return ()=>commands2.call(wrapInHeadingCommand.key, 3);
        }
    },
    TurnIntoH4: {
        shortcuts: "Mod-Alt-4",
        command: (ctx)=>{
            const commands2 = ctx.get(__TURBOPACK__imported__module__$5b$project$5d2f$RiderProjects$2f$SyriaHub$2f$node_modules$2f40$milkdown$2f$core$2f$lib$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["commandsCtx"]);
            return ()=>commands2.call(wrapInHeadingCommand.key, 4);
        }
    },
    TurnIntoH5: {
        shortcuts: "Mod-Alt-5",
        command: (ctx)=>{
            const commands2 = ctx.get(__TURBOPACK__imported__module__$5b$project$5d2f$RiderProjects$2f$SyriaHub$2f$node_modules$2f40$milkdown$2f$core$2f$lib$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["commandsCtx"]);
            return ()=>commands2.call(wrapInHeadingCommand.key, 5);
        }
    },
    TurnIntoH6: {
        shortcuts: "Mod-Alt-6",
        command: (ctx)=>{
            const commands2 = ctx.get(__TURBOPACK__imported__module__$5b$project$5d2f$RiderProjects$2f$SyriaHub$2f$node_modules$2f40$milkdown$2f$core$2f$lib$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["commandsCtx"]);
            return ()=>commands2.call(wrapInHeadingCommand.key, 6);
        }
    },
    DowngradeHeading: {
        shortcuts: [
            "Delete",
            "Backspace"
        ],
        command: (ctx)=>{
            const commands2 = ctx.get(__TURBOPACK__imported__module__$5b$project$5d2f$RiderProjects$2f$SyriaHub$2f$node_modules$2f40$milkdown$2f$core$2f$lib$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["commandsCtx"]);
            return ()=>commands2.call(downgradeHeadingCommand.key);
        }
    }
});
withMeta(headingKeymap.ctx, {
    displayName: "KeymapCtx<heading>",
    group: "Heading"
});
withMeta(headingKeymap.shortcuts, {
    displayName: "Keymap<heading>",
    group: "Heading"
});
const blockquoteAttr = (0, __TURBOPACK__imported__module__$5b$project$5d2f$RiderProjects$2f$SyriaHub$2f$node_modules$2f40$milkdown$2f$utils$2f$lib$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["$nodeAttr"])("blockquote");
withMeta(blockquoteAttr, {
    displayName: "Attr<blockquote>",
    group: "Blockquote"
});
const blockquoteSchema = (0, __TURBOPACK__imported__module__$5b$project$5d2f$RiderProjects$2f$SyriaHub$2f$node_modules$2f40$milkdown$2f$utils$2f$lib$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["$nodeSchema"])("blockquote", (ctx)=>({
        content: "block+",
        group: "block",
        defining: true,
        parseDOM: [
            {
                tag: "blockquote"
            }
        ],
        toDOM: (node)=>[
                "blockquote",
                ctx.get(blockquoteAttr.key)(node),
                0
            ],
        parseMarkdown: {
            match: ({ type })=>type === "blockquote",
            runner: (state, node, type)=>{
                state.openNode(type).next(node.children).closeNode();
            }
        },
        toMarkdown: {
            match: (node)=>node.type.name === "blockquote",
            runner: (state, node)=>{
                state.openNode("blockquote").next(node.content).closeNode();
            }
        }
    }));
withMeta(blockquoteSchema.node, {
    displayName: "NodeSchema<blockquote>",
    group: "Blockquote"
});
withMeta(blockquoteSchema.ctx, {
    displayName: "NodeSchemaCtx<blockquote>",
    group: "Blockquote"
});
const wrapInBlockquoteInputRule = (0, __TURBOPACK__imported__module__$5b$project$5d2f$RiderProjects$2f$SyriaHub$2f$node_modules$2f40$milkdown$2f$utils$2f$lib$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["$inputRule"])((ctx)=>(0, __TURBOPACK__imported__module__$5b$project$5d2f$RiderProjects$2f$SyriaHub$2f$node_modules$2f$prosemirror$2d$inputrules$2f$dist$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["wrappingInputRule"])(/^\s*>\s$/, blockquoteSchema.type(ctx)));
withMeta(wrapInBlockquoteInputRule, {
    displayName: "InputRule<wrapInBlockquoteInputRule>",
    group: "Blockquote"
});
const wrapInBlockquoteCommand = (0, __TURBOPACK__imported__module__$5b$project$5d2f$RiderProjects$2f$SyriaHub$2f$node_modules$2f40$milkdown$2f$utils$2f$lib$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["$command"])("WrapInBlockquote", (ctx)=>()=>(0, __TURBOPACK__imported__module__$5b$project$5d2f$RiderProjects$2f$SyriaHub$2f$node_modules$2f$prosemirror$2d$commands$2f$dist$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["wrapIn"])(blockquoteSchema.type(ctx)));
withMeta(wrapInBlockquoteCommand, {
    displayName: "Command<wrapInBlockquoteCommand>",
    group: "Blockquote"
});
const blockquoteKeymap = (0, __TURBOPACK__imported__module__$5b$project$5d2f$RiderProjects$2f$SyriaHub$2f$node_modules$2f40$milkdown$2f$utils$2f$lib$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["$useKeymap"])("blockquoteKeymap", {
    WrapInBlockquote: {
        shortcuts: "Mod-Shift-b",
        command: (ctx)=>{
            const commands2 = ctx.get(__TURBOPACK__imported__module__$5b$project$5d2f$RiderProjects$2f$SyriaHub$2f$node_modules$2f40$milkdown$2f$core$2f$lib$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["commandsCtx"]);
            return ()=>commands2.call(wrapInBlockquoteCommand.key);
        }
    }
});
withMeta(blockquoteKeymap.ctx, {
    displayName: "KeymapCtx<blockquote>",
    group: "Blockquote"
});
withMeta(blockquoteKeymap.shortcuts, {
    displayName: "Keymap<blockquote>",
    group: "Blockquote"
});
const codeBlockAttr = (0, __TURBOPACK__imported__module__$5b$project$5d2f$RiderProjects$2f$SyriaHub$2f$node_modules$2f40$milkdown$2f$utils$2f$lib$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["$nodeAttr"])("codeBlock", ()=>({
        pre: {},
        code: {}
    }));
withMeta(codeBlockAttr, {
    displayName: "Attr<codeBlock>",
    group: "CodeBlock"
});
const codeBlockSchema = (0, __TURBOPACK__imported__module__$5b$project$5d2f$RiderProjects$2f$SyriaHub$2f$node_modules$2f40$milkdown$2f$utils$2f$lib$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["$nodeSchema"])("code_block", (ctx)=>{
    return {
        content: "text*",
        group: "block",
        marks: "",
        defining: true,
        code: true,
        attrs: {
            language: {
                default: "",
                validate: "string"
            }
        },
        parseDOM: [
            {
                tag: "pre",
                preserveWhitespace: "full",
                getAttrs: (dom)=>{
                    if (!(dom instanceof HTMLElement)) throw (0, __TURBOPACK__imported__module__$5b$project$5d2f$RiderProjects$2f$SyriaHub$2f$node_modules$2f40$milkdown$2f$exception$2f$lib$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["expectDomTypeError"])(dom);
                    return {
                        language: dom.dataset.language
                    };
                }
            }
        ],
        toDOM: (node)=>{
            const attr = ctx.get(codeBlockAttr.key)(node);
            const language = node.attrs.language;
            const languageAttrs = language && language.length > 0 ? {
                "data-language": language
            } : void 0;
            return [
                "pre",
                {
                    ...attr.pre,
                    ...languageAttrs
                },
                [
                    "code",
                    attr.code,
                    0
                ]
            ];
        },
        parseMarkdown: {
            match: ({ type })=>type === "code",
            runner: (state, node, type)=>{
                const language = node.lang ?? "";
                const value = node.value;
                state.openNode(type, {
                    language
                });
                if (value) state.addText(value);
                state.closeNode();
            }
        },
        toMarkdown: {
            match: (node)=>node.type.name === "code_block",
            runner: (state, node)=>{
                state.addNode("code", void 0, node.content.firstChild?.text || "", {
                    lang: node.attrs.language
                });
            }
        }
    };
});
withMeta(codeBlockSchema.node, {
    displayName: "NodeSchema<codeBlock>",
    group: "CodeBlock"
});
withMeta(codeBlockSchema.ctx, {
    displayName: "NodeSchemaCtx<codeBlock>",
    group: "CodeBlock"
});
const createCodeBlockInputRule = (0, __TURBOPACK__imported__module__$5b$project$5d2f$RiderProjects$2f$SyriaHub$2f$node_modules$2f40$milkdown$2f$utils$2f$lib$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["$inputRule"])((ctx)=>(0, __TURBOPACK__imported__module__$5b$project$5d2f$RiderProjects$2f$SyriaHub$2f$node_modules$2f$prosemirror$2d$inputrules$2f$dist$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["textblockTypeInputRule"])(/^```(?<language>[a-z]*)?[\s\n]$/, codeBlockSchema.type(ctx), (match)=>({
            language: match.groups?.language ?? ""
        })));
withMeta(createCodeBlockInputRule, {
    displayName: "InputRule<createCodeBlockInputRule>",
    group: "CodeBlock"
});
const createCodeBlockCommand = (0, __TURBOPACK__imported__module__$5b$project$5d2f$RiderProjects$2f$SyriaHub$2f$node_modules$2f40$milkdown$2f$utils$2f$lib$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["$command"])("CreateCodeBlock", (ctx)=>(language = "")=>(0, __TURBOPACK__imported__module__$5b$project$5d2f$RiderProjects$2f$SyriaHub$2f$node_modules$2f$prosemirror$2d$commands$2f$dist$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["setBlockType"])(codeBlockSchema.type(ctx), {
            language
        }));
withMeta(createCodeBlockCommand, {
    displayName: "Command<createCodeBlockCommand>",
    group: "CodeBlock"
});
const updateCodeBlockLanguageCommand = (0, __TURBOPACK__imported__module__$5b$project$5d2f$RiderProjects$2f$SyriaHub$2f$node_modules$2f40$milkdown$2f$utils$2f$lib$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["$command"])("UpdateCodeBlockLanguage", ()=>({ pos, language } = {
        pos: -1,
        language: ""
    })=>(state, dispatch)=>{
            if (pos >= 0) {
                dispatch?.(state.tr.setNodeAttribute(pos, "language", language));
                return true;
            }
            return false;
        });
withMeta(updateCodeBlockLanguageCommand, {
    displayName: "Command<updateCodeBlockLanguageCommand>",
    group: "CodeBlock"
});
const codeBlockKeymap = (0, __TURBOPACK__imported__module__$5b$project$5d2f$RiderProjects$2f$SyriaHub$2f$node_modules$2f40$milkdown$2f$utils$2f$lib$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["$useKeymap"])("codeBlockKeymap", {
    CreateCodeBlock: {
        shortcuts: "Mod-Alt-c",
        command: (ctx)=>{
            const commands2 = ctx.get(__TURBOPACK__imported__module__$5b$project$5d2f$RiderProjects$2f$SyriaHub$2f$node_modules$2f40$milkdown$2f$core$2f$lib$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["commandsCtx"]);
            return ()=>commands2.call(createCodeBlockCommand.key);
        }
    }
});
withMeta(codeBlockKeymap.ctx, {
    displayName: "KeymapCtx<codeBlock>",
    group: "CodeBlock"
});
withMeta(codeBlockKeymap.shortcuts, {
    displayName: "Keymap<codeBlock>",
    group: "CodeBlock"
});
const imageAttr = (0, __TURBOPACK__imported__module__$5b$project$5d2f$RiderProjects$2f$SyriaHub$2f$node_modules$2f40$milkdown$2f$utils$2f$lib$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["$nodeAttr"])("image");
withMeta(imageAttr, {
    displayName: "Attr<image>",
    group: "Image"
});
const imageSchema = (0, __TURBOPACK__imported__module__$5b$project$5d2f$RiderProjects$2f$SyriaHub$2f$node_modules$2f40$milkdown$2f$utils$2f$lib$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["$nodeSchema"])("image", (ctx)=>{
    return {
        inline: true,
        group: "inline",
        selectable: true,
        draggable: true,
        marks: "",
        atom: true,
        defining: true,
        isolating: true,
        attrs: {
            src: {
                default: "",
                validate: "string"
            },
            alt: {
                default: "",
                validate: "string"
            },
            title: {
                default: "",
                validate: "string"
            }
        },
        parseDOM: [
            {
                tag: "img[src]",
                getAttrs: (dom)=>{
                    if (!(dom instanceof HTMLElement)) throw (0, __TURBOPACK__imported__module__$5b$project$5d2f$RiderProjects$2f$SyriaHub$2f$node_modules$2f40$milkdown$2f$exception$2f$lib$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["expectDomTypeError"])(dom);
                    return {
                        src: dom.getAttribute("src") || "",
                        alt: dom.getAttribute("alt") || "",
                        title: dom.getAttribute("title") || dom.getAttribute("alt") || ""
                    };
                }
            }
        ],
        toDOM: (node)=>{
            return [
                "img",
                {
                    ...ctx.get(imageAttr.key)(node),
                    ...node.attrs
                }
            ];
        },
        parseMarkdown: {
            match: ({ type })=>type === "image",
            runner: (state, node, type)=>{
                const url = node.url;
                const alt = node.alt;
                const title = node.title;
                state.addNode(type, {
                    src: url,
                    alt,
                    title
                });
            }
        },
        toMarkdown: {
            match: (node)=>node.type.name === "image",
            runner: (state, node)=>{
                state.addNode("image", void 0, void 0, {
                    title: node.attrs.title,
                    url: node.attrs.src,
                    alt: node.attrs.alt
                });
            }
        }
    };
});
withMeta(imageSchema.node, {
    displayName: "NodeSchema<image>",
    group: "Image"
});
withMeta(imageSchema.ctx, {
    displayName: "NodeSchemaCtx<image>",
    group: "Image"
});
const insertImageCommand = (0, __TURBOPACK__imported__module__$5b$project$5d2f$RiderProjects$2f$SyriaHub$2f$node_modules$2f40$milkdown$2f$utils$2f$lib$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["$command"])("InsertImage", (ctx)=>(payload = {})=>(state, dispatch)=>{
            if (!dispatch) return true;
            const { src = "", alt = "", title = "" } = payload;
            const node = imageSchema.type(ctx).create({
                src,
                alt,
                title
            });
            if (!node) return true;
            dispatch(state.tr.replaceSelectionWith(node).scrollIntoView());
            return true;
        });
withMeta(insertImageCommand, {
    displayName: "Command<insertImageCommand>",
    group: "Image"
});
const updateImageCommand = (0, __TURBOPACK__imported__module__$5b$project$5d2f$RiderProjects$2f$SyriaHub$2f$node_modules$2f40$milkdown$2f$utils$2f$lib$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["$command"])("UpdateImage", (ctx)=>(payload = {})=>(state, dispatch)=>{
            const nodeWithPos = (0, __TURBOPACK__imported__module__$5b$project$5d2f$RiderProjects$2f$SyriaHub$2f$node_modules$2f40$milkdown$2f$prose$2f$lib$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["findSelectedNodeOfType"])(state.selection, imageSchema.type(ctx));
            if (!nodeWithPos) return false;
            const { node, pos } = nodeWithPos;
            const newAttrs = {
                ...node.attrs
            };
            const { src, alt, title } = payload;
            if (src !== void 0) newAttrs.src = src;
            if (alt !== void 0) newAttrs.alt = alt;
            if (title !== void 0) newAttrs.title = title;
            dispatch?.(state.tr.setNodeMarkup(pos, void 0, newAttrs).scrollIntoView());
            return true;
        });
withMeta(updateImageCommand, {
    displayName: "Command<updateImageCommand>",
    group: "Image"
});
const insertImageInputRule = (0, __TURBOPACK__imported__module__$5b$project$5d2f$RiderProjects$2f$SyriaHub$2f$node_modules$2f40$milkdown$2f$utils$2f$lib$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["$inputRule"])((ctx)=>new __TURBOPACK__imported__module__$5b$project$5d2f$RiderProjects$2f$SyriaHub$2f$node_modules$2f$prosemirror$2d$inputrules$2f$dist$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["InputRule"](/!\[(?<alt>.*?)]\((?<filename>.*?)\s*(?="|\))"?(?<title>[^"]+)?"?\)/, (state, match, start, end)=>{
        const [matched, alt, src = "", title] = match;
        if (matched) return state.tr.replaceWith(start, end, imageSchema.type(ctx).create({
            src,
            alt,
            title
        }));
        return null;
    }));
withMeta(insertImageInputRule, {
    displayName: "InputRule<insertImageInputRule>",
    group: "Image"
});
const hardbreakAttr = (0, __TURBOPACK__imported__module__$5b$project$5d2f$RiderProjects$2f$SyriaHub$2f$node_modules$2f40$milkdown$2f$utils$2f$lib$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["$nodeAttr"])("hardbreak", (node)=>{
    return {
        "data-type": "hardbreak",
        "data-is-inline": node.attrs.isInline
    };
});
withMeta(hardbreakAttr, {
    displayName: "Attr<hardbreak>",
    group: "Hardbreak"
});
const hardbreakSchema = (0, __TURBOPACK__imported__module__$5b$project$5d2f$RiderProjects$2f$SyriaHub$2f$node_modules$2f40$milkdown$2f$utils$2f$lib$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["$nodeSchema"])("hardbreak", (ctx)=>({
        inline: true,
        group: "inline",
        attrs: {
            isInline: {
                default: false,
                validate: "boolean"
            }
        },
        selectable: false,
        parseDOM: [
            {
                tag: "br"
            },
            {
                tag: 'span[data-type="hardbreak"]',
                getAttrs: ()=>({
                        isInline: true
                    })
            }
        ],
        toDOM: (node)=>node.attrs.isInline ? [
                "span",
                ctx.get(hardbreakAttr.key)(node),
                " "
            ] : [
                "br",
                ctx.get(hardbreakAttr.key)(node)
            ],
        parseMarkdown: {
            match: ({ type })=>type === "break",
            runner: (state, node, type)=>{
                state.addNode(type, {
                    isInline: Boolean(node.data?.isInline)
                });
            }
        },
        leafText: ()=>"\n",
        toMarkdown: {
            match: (node)=>node.type.name === "hardbreak",
            runner: (state, node)=>{
                if (node.attrs.isInline) state.addNode("text", void 0, "\n");
                else state.addNode("break");
            }
        }
    }));
withMeta(hardbreakSchema.node, {
    displayName: "NodeSchema<hardbreak>",
    group: "Hardbreak"
});
withMeta(hardbreakSchema.ctx, {
    displayName: "NodeSchemaCtx<hardbreak>",
    group: "Hardbreak"
});
const insertHardbreakCommand = (0, __TURBOPACK__imported__module__$5b$project$5d2f$RiderProjects$2f$SyriaHub$2f$node_modules$2f40$milkdown$2f$utils$2f$lib$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["$command"])("InsertHardbreak", (ctx)=>()=>(state, dispatch)=>{
            const { selection, tr } = state;
            if (!(selection instanceof __TURBOPACK__imported__module__$5b$project$5d2f$RiderProjects$2f$SyriaHub$2f$node_modules$2f$prosemirror$2d$state$2f$dist$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["TextSelection"])) return false;
            if (selection.empty) {
                const node = selection.$from.node();
                if (node.childCount > 0 && node.lastChild?.type.name === "hardbreak") {
                    dispatch?.(tr.replaceRangeWith(selection.to - 1, selection.to, state.schema.node("paragraph")).setSelection(__TURBOPACK__imported__module__$5b$project$5d2f$RiderProjects$2f$SyriaHub$2f$node_modules$2f$prosemirror$2d$state$2f$dist$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Selection"].near(tr.doc.resolve(selection.to))).scrollIntoView());
                    return true;
                }
            }
            dispatch?.(tr.setMeta("hardbreak", true).replaceSelectionWith(hardbreakSchema.type(ctx).create()).scrollIntoView());
            return true;
        });
withMeta(insertHardbreakCommand, {
    displayName: "Command<insertHardbreakCommand>",
    group: "Hardbreak"
});
const hardbreakKeymap = (0, __TURBOPACK__imported__module__$5b$project$5d2f$RiderProjects$2f$SyriaHub$2f$node_modules$2f40$milkdown$2f$utils$2f$lib$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["$useKeymap"])("hardbreakKeymap", {
    InsertHardbreak: {
        shortcuts: "Shift-Enter",
        command: (ctx)=>{
            const commands2 = ctx.get(__TURBOPACK__imported__module__$5b$project$5d2f$RiderProjects$2f$SyriaHub$2f$node_modules$2f40$milkdown$2f$core$2f$lib$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["commandsCtx"]);
            return ()=>commands2.call(insertHardbreakCommand.key);
        }
    }
});
withMeta(hardbreakKeymap.ctx, {
    displayName: "KeymapCtx<hardbreak>",
    group: "Hardbreak"
});
withMeta(hardbreakKeymap.shortcuts, {
    displayName: "Keymap<hardbreak>",
    group: "Hardbreak"
});
const hrAttr = (0, __TURBOPACK__imported__module__$5b$project$5d2f$RiderProjects$2f$SyriaHub$2f$node_modules$2f40$milkdown$2f$utils$2f$lib$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["$nodeAttr"])("hr");
withMeta(hrAttr, {
    displayName: "Attr<hr>",
    group: "Hr"
});
const hrSchema = (0, __TURBOPACK__imported__module__$5b$project$5d2f$RiderProjects$2f$SyriaHub$2f$node_modules$2f40$milkdown$2f$utils$2f$lib$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["$nodeSchema"])("hr", (ctx)=>({
        group: "block",
        parseDOM: [
            {
                tag: "hr"
            }
        ],
        toDOM: (node)=>[
                "hr",
                ctx.get(hrAttr.key)(node)
            ],
        parseMarkdown: {
            match: ({ type })=>type === "thematicBreak",
            runner: (state, _, type)=>{
                state.addNode(type);
            }
        },
        toMarkdown: {
            match: (node)=>node.type.name === "hr",
            runner: (state)=>{
                state.addNode("thematicBreak");
            }
        }
    }));
withMeta(hrSchema.node, {
    displayName: "NodeSchema<hr>",
    group: "Hr"
});
withMeta(hrSchema.ctx, {
    displayName: "NodeSchemaCtx<hr>",
    group: "Hr"
});
const insertHrInputRule = (0, __TURBOPACK__imported__module__$5b$project$5d2f$RiderProjects$2f$SyriaHub$2f$node_modules$2f40$milkdown$2f$utils$2f$lib$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["$inputRule"])((ctx)=>new __TURBOPACK__imported__module__$5b$project$5d2f$RiderProjects$2f$SyriaHub$2f$node_modules$2f$prosemirror$2d$inputrules$2f$dist$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["InputRule"](/^(?:---|___\s|\*\*\*\s)$/, (state, match, start, end)=>{
        const { tr } = state;
        if (match[0]) tr.replaceWith(start - 1, end, hrSchema.type(ctx).create());
        return tr;
    }));
withMeta(insertHrInputRule, {
    displayName: "InputRule<insertHrInputRule>",
    group: "Hr"
});
const insertHrCommand = (0, __TURBOPACK__imported__module__$5b$project$5d2f$RiderProjects$2f$SyriaHub$2f$node_modules$2f40$milkdown$2f$utils$2f$lib$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["$command"])("InsertHr", (ctx)=>()=>(state, dispatch)=>{
            if (!dispatch) return true;
            const paragraph = paragraphSchema.node.type(ctx).create();
            const { tr, selection } = state;
            const { from } = selection;
            const node = hrSchema.type(ctx).create();
            if (!node) return true;
            const _tr = tr.replaceSelectionWith(node).insert(from, paragraph);
            const sel = __TURBOPACK__imported__module__$5b$project$5d2f$RiderProjects$2f$SyriaHub$2f$node_modules$2f$prosemirror$2d$state$2f$dist$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Selection"].findFrom(_tr.doc.resolve(from), 1, true);
            if (!sel) return true;
            dispatch(_tr.setSelection(sel).scrollIntoView());
            return true;
        });
withMeta(insertHrCommand, {
    displayName: "Command<insertHrCommand>",
    group: "Hr"
});
const bulletListAttr = (0, __TURBOPACK__imported__module__$5b$project$5d2f$RiderProjects$2f$SyriaHub$2f$node_modules$2f40$milkdown$2f$utils$2f$lib$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["$nodeAttr"])("bulletList");
withMeta(bulletListAttr, {
    displayName: "Attr<bulletList>",
    group: "BulletList"
});
const bulletListSchema = (0, __TURBOPACK__imported__module__$5b$project$5d2f$RiderProjects$2f$SyriaHub$2f$node_modules$2f40$milkdown$2f$utils$2f$lib$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["$nodeSchema"])("bullet_list", (ctx)=>{
    return {
        content: "listItem+",
        group: "block",
        attrs: {
            spread: {
                default: false,
                validate: "boolean"
            }
        },
        parseDOM: [
            {
                tag: "ul",
                getAttrs: (dom)=>{
                    if (!(dom instanceof HTMLElement)) throw (0, __TURBOPACK__imported__module__$5b$project$5d2f$RiderProjects$2f$SyriaHub$2f$node_modules$2f40$milkdown$2f$exception$2f$lib$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["expectDomTypeError"])(dom);
                    return {
                        spread: dom.dataset.spread === "true"
                    };
                }
            }
        ],
        toDOM: (node)=>{
            return [
                "ul",
                {
                    ...ctx.get(bulletListAttr.key)(node),
                    "data-spread": node.attrs.spread
                },
                0
            ];
        },
        parseMarkdown: {
            match: ({ type, ordered })=>type === "list" && !ordered,
            runner: (state, node, type)=>{
                const spread = node.spread != null ? `${node.spread}` : "false";
                state.openNode(type, {
                    spread
                }).next(node.children).closeNode();
            }
        },
        toMarkdown: {
            match: (node)=>node.type.name === "bullet_list",
            runner: (state, node)=>{
                state.openNode("list", void 0, {
                    ordered: false,
                    spread: node.attrs.spread
                }).next(node.content).closeNode();
            }
        }
    };
});
withMeta(bulletListSchema.node, {
    displayName: "NodeSchema<bulletList>",
    group: "BulletList"
});
withMeta(bulletListSchema.ctx, {
    displayName: "NodeSchemaCtx<bulletList>",
    group: "BulletList"
});
const wrapInBulletListInputRule = (0, __TURBOPACK__imported__module__$5b$project$5d2f$RiderProjects$2f$SyriaHub$2f$node_modules$2f40$milkdown$2f$utils$2f$lib$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["$inputRule"])((ctx)=>(0, __TURBOPACK__imported__module__$5b$project$5d2f$RiderProjects$2f$SyriaHub$2f$node_modules$2f$prosemirror$2d$inputrules$2f$dist$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["wrappingInputRule"])(/^\s*([-+*])\s$/, bulletListSchema.type(ctx)));
withMeta(wrapInBulletListInputRule, {
    displayName: "InputRule<wrapInBulletListInputRule>",
    group: "BulletList"
});
const wrapInBulletListCommand = (0, __TURBOPACK__imported__module__$5b$project$5d2f$RiderProjects$2f$SyriaHub$2f$node_modules$2f40$milkdown$2f$utils$2f$lib$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["$command"])("WrapInBulletList", (ctx)=>()=>(0, __TURBOPACK__imported__module__$5b$project$5d2f$RiderProjects$2f$SyriaHub$2f$node_modules$2f$prosemirror$2d$commands$2f$dist$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["wrapIn"])(bulletListSchema.type(ctx)));
withMeta(wrapInBulletListCommand, {
    displayName: "Command<wrapInBulletListCommand>",
    group: "BulletList"
});
const bulletListKeymap = (0, __TURBOPACK__imported__module__$5b$project$5d2f$RiderProjects$2f$SyriaHub$2f$node_modules$2f40$milkdown$2f$utils$2f$lib$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["$useKeymap"])("bulletListKeymap", {
    WrapInBulletList: {
        shortcuts: "Mod-Alt-8",
        command: (ctx)=>{
            const commands2 = ctx.get(__TURBOPACK__imported__module__$5b$project$5d2f$RiderProjects$2f$SyriaHub$2f$node_modules$2f40$milkdown$2f$core$2f$lib$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["commandsCtx"]);
            return ()=>commands2.call(wrapInBulletListCommand.key);
        }
    }
});
withMeta(bulletListKeymap.ctx, {
    displayName: "KeymapCtx<bulletListKeymap>",
    group: "BulletList"
});
withMeta(bulletListKeymap.shortcuts, {
    displayName: "Keymap<bulletListKeymap>",
    group: "BulletList"
});
const orderedListAttr = (0, __TURBOPACK__imported__module__$5b$project$5d2f$RiderProjects$2f$SyriaHub$2f$node_modules$2f40$milkdown$2f$utils$2f$lib$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["$nodeAttr"])("orderedList");
withMeta(orderedListAttr, {
    displayName: "Attr<orderedList>",
    group: "OrderedList"
});
const orderedListSchema = (0, __TURBOPACK__imported__module__$5b$project$5d2f$RiderProjects$2f$SyriaHub$2f$node_modules$2f40$milkdown$2f$utils$2f$lib$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["$nodeSchema"])("ordered_list", (ctx)=>({
        content: "listItem+",
        group: "block",
        attrs: {
            order: {
                default: 1,
                validate: "number"
            },
            spread: {
                default: false,
                validate: "boolean"
            }
        },
        parseDOM: [
            {
                tag: "ol",
                getAttrs: (dom)=>{
                    if (!(dom instanceof HTMLElement)) throw (0, __TURBOPACK__imported__module__$5b$project$5d2f$RiderProjects$2f$SyriaHub$2f$node_modules$2f40$milkdown$2f$exception$2f$lib$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["expectDomTypeError"])(dom);
                    return {
                        spread: dom.dataset.spread,
                        order: dom.hasAttribute("start") ? Number(dom.getAttribute("start")) : 1
                    };
                }
            }
        ],
        toDOM: (node)=>[
                "ol",
                {
                    ...ctx.get(orderedListAttr.key)(node),
                    ...node.attrs.order === 1 ? {} : node.attrs.order,
                    "data-spread": node.attrs.spread
                },
                0
            ],
        parseMarkdown: {
            match: ({ type, ordered })=>type === "list" && !!ordered,
            runner: (state, node, type)=>{
                const spread = node.spread != null ? `${node.spread}` : "true";
                state.openNode(type, {
                    spread
                }).next(node.children).closeNode();
            }
        },
        toMarkdown: {
            match: (node)=>node.type.name === "ordered_list",
            runner: (state, node)=>{
                state.openNode("list", void 0, {
                    ordered: true,
                    start: 1,
                    spread: node.attrs.spread === "true"
                });
                state.next(node.content);
                state.closeNode();
            }
        }
    }));
withMeta(orderedListSchema.node, {
    displayName: "NodeSchema<orderedList>",
    group: "OrderedList"
});
withMeta(orderedListSchema.ctx, {
    displayName: "NodeSchemaCtx<orderedList>",
    group: "OrderedList"
});
const wrapInOrderedListInputRule = (0, __TURBOPACK__imported__module__$5b$project$5d2f$RiderProjects$2f$SyriaHub$2f$node_modules$2f40$milkdown$2f$utils$2f$lib$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["$inputRule"])((ctx)=>(0, __TURBOPACK__imported__module__$5b$project$5d2f$RiderProjects$2f$SyriaHub$2f$node_modules$2f$prosemirror$2d$inputrules$2f$dist$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["wrappingInputRule"])(/^\s*(\d+)\.\s$/, orderedListSchema.type(ctx), (match)=>({
            order: Number(match[1])
        }), (match, node)=>node.childCount + node.attrs.order === Number(match[1])));
withMeta(wrapInOrderedListInputRule, {
    displayName: "InputRule<wrapInOrderedListInputRule>",
    group: "OrderedList"
});
const wrapInOrderedListCommand = (0, __TURBOPACK__imported__module__$5b$project$5d2f$RiderProjects$2f$SyriaHub$2f$node_modules$2f40$milkdown$2f$utils$2f$lib$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["$command"])("WrapInOrderedList", (ctx)=>()=>(0, __TURBOPACK__imported__module__$5b$project$5d2f$RiderProjects$2f$SyriaHub$2f$node_modules$2f$prosemirror$2d$commands$2f$dist$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["wrapIn"])(orderedListSchema.type(ctx)));
withMeta(wrapInOrderedListCommand, {
    displayName: "Command<wrapInOrderedListCommand>",
    group: "OrderedList"
});
const orderedListKeymap = (0, __TURBOPACK__imported__module__$5b$project$5d2f$RiderProjects$2f$SyriaHub$2f$node_modules$2f40$milkdown$2f$utils$2f$lib$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["$useKeymap"])("orderedListKeymap", {
    WrapInOrderedList: {
        shortcuts: "Mod-Alt-7",
        command: (ctx)=>{
            const commands2 = ctx.get(__TURBOPACK__imported__module__$5b$project$5d2f$RiderProjects$2f$SyriaHub$2f$node_modules$2f40$milkdown$2f$core$2f$lib$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["commandsCtx"]);
            return ()=>commands2.call(wrapInOrderedListCommand.key);
        }
    }
});
withMeta(orderedListKeymap.ctx, {
    displayName: "KeymapCtx<orderedList>",
    group: "OrderedList"
});
withMeta(orderedListKeymap.shortcuts, {
    displayName: "Keymap<orderedList>",
    group: "OrderedList"
});
const listItemAttr = (0, __TURBOPACK__imported__module__$5b$project$5d2f$RiderProjects$2f$SyriaHub$2f$node_modules$2f40$milkdown$2f$utils$2f$lib$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["$nodeAttr"])("listItem");
withMeta(listItemAttr, {
    displayName: "Attr<listItem>",
    group: "ListItem"
});
const listItemSchema = (0, __TURBOPACK__imported__module__$5b$project$5d2f$RiderProjects$2f$SyriaHub$2f$node_modules$2f40$milkdown$2f$utils$2f$lib$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["$nodeSchema"])("list_item", (ctx)=>({
        group: "listItem",
        content: "paragraph block*",
        attrs: {
            label: {
                default: "•",
                validate: "string"
            },
            listType: {
                default: "bullet",
                validate: "string"
            },
            spread: {
                default: true,
                validate: "boolean"
            }
        },
        defining: true,
        parseDOM: [
            {
                tag: "li",
                getAttrs: (dom)=>{
                    if (!(dom instanceof HTMLElement)) throw (0, __TURBOPACK__imported__module__$5b$project$5d2f$RiderProjects$2f$SyriaHub$2f$node_modules$2f40$milkdown$2f$exception$2f$lib$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["expectDomTypeError"])(dom);
                    return {
                        label: dom.dataset.label,
                        listType: dom.dataset.listType,
                        spread: dom.dataset.spread === "true"
                    };
                }
            }
        ],
        toDOM: (node)=>[
                "li",
                {
                    ...ctx.get(listItemAttr.key)(node),
                    "data-label": node.attrs.label,
                    "data-list-type": node.attrs.listType,
                    "data-spread": node.attrs.spread
                },
                0
            ],
        parseMarkdown: {
            match: ({ type })=>type === "listItem",
            runner: (state, node, type)=>{
                const label = node.label != null ? `${node.label}.` : "•";
                const listType = node.label != null ? "ordered" : "bullet";
                const spread = node.spread != null ? `${node.spread}` : "true";
                state.openNode(type, {
                    label,
                    listType,
                    spread
                });
                state.next(node.children);
                state.closeNode();
            }
        },
        toMarkdown: {
            match: (node)=>node.type.name === "list_item",
            runner: (state, node)=>{
                state.openNode("listItem", void 0, {
                    spread: node.attrs.spread
                });
                state.next(node.content);
                state.closeNode();
            }
        }
    }));
withMeta(listItemSchema.node, {
    displayName: "NodeSchema<listItem>",
    group: "ListItem"
});
withMeta(listItemSchema.ctx, {
    displayName: "NodeSchemaCtx<listItem>",
    group: "ListItem"
});
const sinkListItemCommand = (0, __TURBOPACK__imported__module__$5b$project$5d2f$RiderProjects$2f$SyriaHub$2f$node_modules$2f40$milkdown$2f$utils$2f$lib$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["$command"])("SinkListItem", (ctx)=>()=>(0, __TURBOPACK__imported__module__$5b$project$5d2f$RiderProjects$2f$SyriaHub$2f$node_modules$2f$prosemirror$2d$schema$2d$list$2f$dist$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["sinkListItem"])(listItemSchema.type(ctx)));
withMeta(sinkListItemCommand, {
    displayName: "Command<sinkListItemCommand>",
    group: "ListItem"
});
const liftListItemCommand = (0, __TURBOPACK__imported__module__$5b$project$5d2f$RiderProjects$2f$SyriaHub$2f$node_modules$2f40$milkdown$2f$utils$2f$lib$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["$command"])("LiftListItem", (ctx)=>()=>(0, __TURBOPACK__imported__module__$5b$project$5d2f$RiderProjects$2f$SyriaHub$2f$node_modules$2f$prosemirror$2d$schema$2d$list$2f$dist$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["liftListItem"])(listItemSchema.type(ctx)));
withMeta(liftListItemCommand, {
    displayName: "Command<liftListItemCommand>",
    group: "ListItem"
});
const splitListItemCommand = (0, __TURBOPACK__imported__module__$5b$project$5d2f$RiderProjects$2f$SyriaHub$2f$node_modules$2f40$milkdown$2f$utils$2f$lib$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["$command"])("SplitListItem", (ctx)=>()=>(0, __TURBOPACK__imported__module__$5b$project$5d2f$RiderProjects$2f$SyriaHub$2f$node_modules$2f$prosemirror$2d$schema$2d$list$2f$dist$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["splitListItem"])(listItemSchema.type(ctx)));
withMeta(splitListItemCommand, {
    displayName: "Command<splitListItemCommand>",
    group: "ListItem"
});
function liftFirstListItem(ctx) {
    return (state, dispatch, view)=>{
        const { selection } = state;
        if (!(selection instanceof __TURBOPACK__imported__module__$5b$project$5d2f$RiderProjects$2f$SyriaHub$2f$node_modules$2f$prosemirror$2d$state$2f$dist$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["TextSelection"])) return false;
        const { empty, $from } = selection;
        if (!empty || $from.parentOffset !== 0) return false;
        const parentItem = $from.node(-1);
        if (parentItem.type !== listItemSchema.type(ctx)) return false;
        return (0, __TURBOPACK__imported__module__$5b$project$5d2f$RiderProjects$2f$SyriaHub$2f$node_modules$2f$prosemirror$2d$commands$2f$dist$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["joinBackward"])(state, dispatch, view);
    };
}
const liftFirstListItemCommand = (0, __TURBOPACK__imported__module__$5b$project$5d2f$RiderProjects$2f$SyriaHub$2f$node_modules$2f40$milkdown$2f$utils$2f$lib$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["$command"])("LiftFirstListItem", (ctx)=>()=>liftFirstListItem(ctx));
withMeta(liftFirstListItemCommand, {
    displayName: "Command<liftFirstListItemCommand>",
    group: "ListItem"
});
const listItemKeymap = (0, __TURBOPACK__imported__module__$5b$project$5d2f$RiderProjects$2f$SyriaHub$2f$node_modules$2f40$milkdown$2f$utils$2f$lib$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["$useKeymap"])("listItemKeymap", {
    NextListItem: {
        shortcuts: "Enter",
        command: (ctx)=>{
            const commands2 = ctx.get(__TURBOPACK__imported__module__$5b$project$5d2f$RiderProjects$2f$SyriaHub$2f$node_modules$2f40$milkdown$2f$core$2f$lib$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["commandsCtx"]);
            return ()=>commands2.call(splitListItemCommand.key);
        }
    },
    SinkListItem: {
        shortcuts: [
            "Tab",
            "Mod-]"
        ],
        command: (ctx)=>{
            const commands2 = ctx.get(__TURBOPACK__imported__module__$5b$project$5d2f$RiderProjects$2f$SyriaHub$2f$node_modules$2f40$milkdown$2f$core$2f$lib$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["commandsCtx"]);
            return ()=>commands2.call(sinkListItemCommand.key);
        }
    },
    LiftListItem: {
        shortcuts: [
            "Shift-Tab",
            "Mod-["
        ],
        command: (ctx)=>{
            const commands2 = ctx.get(__TURBOPACK__imported__module__$5b$project$5d2f$RiderProjects$2f$SyriaHub$2f$node_modules$2f40$milkdown$2f$core$2f$lib$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["commandsCtx"]);
            return ()=>commands2.call(liftListItemCommand.key);
        }
    },
    LiftFirstListItem: {
        shortcuts: [
            "Backspace",
            "Delete"
        ],
        command: (ctx)=>{
            const commands2 = ctx.get(__TURBOPACK__imported__module__$5b$project$5d2f$RiderProjects$2f$SyriaHub$2f$node_modules$2f40$milkdown$2f$core$2f$lib$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["commandsCtx"]);
            return ()=>commands2.call(liftFirstListItemCommand.key);
        }
    }
});
withMeta(listItemKeymap.ctx, {
    displayName: "KeymapCtx<listItem>",
    group: "ListItem"
});
withMeta(listItemKeymap.shortcuts, {
    displayName: "Keymap<listItem>",
    group: "ListItem"
});
const textSchema = (0, __TURBOPACK__imported__module__$5b$project$5d2f$RiderProjects$2f$SyriaHub$2f$node_modules$2f40$milkdown$2f$utils$2f$lib$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["$node"])("text", ()=>({
        group: "inline",
        parseMarkdown: {
            match: ({ type })=>type === "text",
            runner: (state, node)=>{
                state.addText(node.value);
            }
        },
        toMarkdown: {
            match: (node)=>node.type.name === "text",
            runner: (state, node)=>{
                state.addNode("text", void 0, node.text);
            }
        }
    }));
withMeta(textSchema, {
    displayName: "NodeSchema<text>",
    group: "Text"
});
const htmlAttr = (0, __TURBOPACK__imported__module__$5b$project$5d2f$RiderProjects$2f$SyriaHub$2f$node_modules$2f40$milkdown$2f$utils$2f$lib$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["$nodeAttr"])("html");
withMeta(htmlAttr, {
    displayName: "Attr<html>",
    group: "Html"
});
const htmlSchema = (0, __TURBOPACK__imported__module__$5b$project$5d2f$RiderProjects$2f$SyriaHub$2f$node_modules$2f40$milkdown$2f$utils$2f$lib$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["$nodeSchema"])("html", (ctx)=>{
    return {
        atom: true,
        group: "inline",
        inline: true,
        attrs: {
            value: {
                default: "",
                validate: "string"
            }
        },
        toDOM: (node)=>{
            const span = document.createElement("span");
            const attr = {
                ...ctx.get(htmlAttr.key)(node),
                "data-value": node.attrs.value,
                "data-type": "html"
            };
            span.textContent = node.attrs.value;
            return [
                "span",
                attr,
                node.attrs.value
            ];
        },
        parseDOM: [
            {
                tag: 'span[data-type="html"]',
                getAttrs: (dom)=>{
                    return {
                        value: dom.dataset.value ?? ""
                    };
                }
            }
        ],
        parseMarkdown: {
            match: ({ type })=>Boolean(type === "html"),
            runner: (state, node, type)=>{
                state.addNode(type, {
                    value: node.value
                });
            }
        },
        toMarkdown: {
            match: (node)=>node.type.name === "html",
            runner: (state, node)=>{
                state.addNode("html", void 0, node.attrs.value);
            }
        }
    };
});
withMeta(htmlSchema.node, {
    displayName: "NodeSchema<html>",
    group: "Html"
});
withMeta(htmlSchema.ctx, {
    displayName: "NodeSchemaCtx<html>",
    group: "Html"
});
const schema = [
    docSchema,
    paragraphAttr,
    paragraphSchema,
    headingIdGenerator,
    headingAttr,
    headingSchema,
    hardbreakAttr,
    hardbreakSchema,
    blockquoteAttr,
    blockquoteSchema,
    codeBlockAttr,
    codeBlockSchema,
    hrAttr,
    hrSchema,
    imageAttr,
    imageSchema,
    bulletListAttr,
    bulletListSchema,
    orderedListAttr,
    orderedListSchema,
    listItemAttr,
    listItemSchema,
    emphasisAttr,
    emphasisSchema,
    strongAttr,
    strongSchema,
    inlineCodeAttr,
    inlineCodeSchema,
    linkAttr,
    linkSchema,
    htmlAttr,
    htmlSchema,
    textSchema
].flat();
const inputRules = [
    wrapInBlockquoteInputRule,
    wrapInBulletListInputRule,
    wrapInOrderedListInputRule,
    createCodeBlockInputRule,
    insertHrInputRule,
    wrapInHeadingInputRule
].flat();
const markInputRules = [
    emphasisStarInputRule,
    emphasisUnderscoreInputRule,
    inlineCodeInputRule,
    strongInputRule
];
const isMarkSelectedCommand = (0, __TURBOPACK__imported__module__$5b$project$5d2f$RiderProjects$2f$SyriaHub$2f$node_modules$2f40$milkdown$2f$utils$2f$lib$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["$command"])("IsMarkSelected", ()=>(markType)=>(state)=>{
            if (!markType) return false;
            const { doc, selection } = state;
            const hasLink = doc.rangeHasMark(selection.from, selection.to, markType);
            return hasLink;
        });
const isNodeSelectedCommand = (0, __TURBOPACK__imported__module__$5b$project$5d2f$RiderProjects$2f$SyriaHub$2f$node_modules$2f40$milkdown$2f$utils$2f$lib$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["$command"])("IsNoteSelected", ()=>(nodeType)=>(state)=>{
            if (!nodeType) return false;
            const result = (0, __TURBOPACK__imported__module__$5b$project$5d2f$RiderProjects$2f$SyriaHub$2f$node_modules$2f40$milkdown$2f$prose$2f$lib$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["findNodeInSelection"])(state, nodeType);
            return result.hasNode;
        });
const clearTextInCurrentBlockCommand = (0, __TURBOPACK__imported__module__$5b$project$5d2f$RiderProjects$2f$SyriaHub$2f$node_modules$2f40$milkdown$2f$utils$2f$lib$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["$command"])("ClearTextInCurrentBlock", ()=>()=>(state, dispatch)=>{
            let tr = state.tr;
            const { $from, $to } = tr.selection;
            const { pos: from } = $from;
            const { pos: right } = $to;
            const left = from - $from.node().content.size;
            if (left < 0) return false;
            tr = tr.deleteRange(left, right);
            dispatch?.(tr);
            return true;
        });
const setBlockTypeCommand = (0, __TURBOPACK__imported__module__$5b$project$5d2f$RiderProjects$2f$SyriaHub$2f$node_modules$2f40$milkdown$2f$utils$2f$lib$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["$command"])("SetBlockType", ()=>(payload)=>(state, dispatch)=>{
            const { nodeType, attrs = null } = payload ?? {};
            if (!nodeType) return false;
            const tr = state.tr;
            const { from, to } = tr.selection;
            try {
                tr.setBlockType(from, to, nodeType, attrs);
            } catch  {
                return false;
            }
            dispatch?.(tr);
            return true;
        });
const wrapInBlockTypeCommand = (0, __TURBOPACK__imported__module__$5b$project$5d2f$RiderProjects$2f$SyriaHub$2f$node_modules$2f40$milkdown$2f$utils$2f$lib$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["$command"])("WrapInBlockType", ()=>(payload)=>(state, dispatch)=>{
            const { nodeType, attrs = null } = payload ?? {};
            if (!nodeType) return false;
            let tr = state.tr;
            try {
                const { $from, $to } = tr.selection;
                const blockRange = $from.blockRange($to);
                const wrapping = blockRange && (0, __TURBOPACK__imported__module__$5b$project$5d2f$RiderProjects$2f$SyriaHub$2f$node_modules$2f$prosemirror$2d$transform$2f$dist$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["findWrapping"])(blockRange, nodeType, attrs);
                if (!wrapping) return false;
                tr = tr.wrap(blockRange, wrapping);
            } catch  {
                return false;
            }
            dispatch?.(tr);
            return true;
        });
const addBlockTypeCommand = (0, __TURBOPACK__imported__module__$5b$project$5d2f$RiderProjects$2f$SyriaHub$2f$node_modules$2f40$milkdown$2f$utils$2f$lib$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["$command"])("AddBlockType", ()=>(payload)=>(state, dispatch)=>{
            const { nodeType, attrs = null } = payload ?? {};
            if (!nodeType) return false;
            const tr = state.tr;
            try {
                const node = nodeType instanceof __TURBOPACK__imported__module__$5b$project$5d2f$RiderProjects$2f$SyriaHub$2f$node_modules$2f$prosemirror$2d$model$2f$dist$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Node"] ? nodeType : nodeType.createAndFill(attrs);
                if (!node) return false;
                tr.replaceSelectionWith(node);
            } catch  {
                return false;
            }
            dispatch?.(tr);
            return true;
        });
const selectTextNearPosCommand = (0, __TURBOPACK__imported__module__$5b$project$5d2f$RiderProjects$2f$SyriaHub$2f$node_modules$2f40$milkdown$2f$utils$2f$lib$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["$command"])("SelectTextNearPos", ()=>(payload)=>(state, dispatch)=>{
            const { pos } = payload ?? {};
            if (pos == null) return false;
            const clamp = (value, min, max)=>Math.min(Math.max(value, min), max);
            const tr = state.tr;
            try {
                const $pos = state.doc.resolve(clamp(pos, 0, state.doc.content.size));
                tr.setSelection(__TURBOPACK__imported__module__$5b$project$5d2f$RiderProjects$2f$SyriaHub$2f$node_modules$2f$prosemirror$2d$state$2f$dist$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["TextSelection"].near($pos));
            } catch  {
                return false;
            }
            dispatch?.(tr.scrollIntoView());
            return true;
        });
const commands = [
    turnIntoTextCommand,
    wrapInBlockquoteCommand,
    wrapInHeadingCommand,
    downgradeHeadingCommand,
    createCodeBlockCommand,
    insertHardbreakCommand,
    insertHrCommand,
    insertImageCommand,
    updateImageCommand,
    wrapInOrderedListCommand,
    wrapInBulletListCommand,
    sinkListItemCommand,
    splitListItemCommand,
    liftListItemCommand,
    liftFirstListItemCommand,
    toggleEmphasisCommand,
    toggleInlineCodeCommand,
    toggleStrongCommand,
    toggleLinkCommand,
    updateLinkCommand,
    isMarkSelectedCommand,
    isNodeSelectedCommand,
    clearTextInCurrentBlockCommand,
    setBlockTypeCommand,
    wrapInBlockTypeCommand,
    addBlockTypeCommand,
    selectTextNearPosCommand
];
const keymap = [
    blockquoteKeymap,
    codeBlockKeymap,
    hardbreakKeymap,
    headingKeymap,
    listItemKeymap,
    orderedListKeymap,
    bulletListKeymap,
    paragraphKeymap,
    emphasisKeymap,
    inlineCodeKeymap,
    strongKeymap
].flat();
const remarkAddOrderInListPlugin = (0, __TURBOPACK__imported__module__$5b$project$5d2f$RiderProjects$2f$SyriaHub$2f$node_modules$2f40$milkdown$2f$utils$2f$lib$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["$remark"])("remarkAddOrderInList", ()=>()=>(tree)=>{
            (0, __TURBOPACK__imported__module__$5b$project$5d2f$RiderProjects$2f$SyriaHub$2f$node_modules$2f$unist$2d$util$2d$visit$2f$lib$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$locals$3e$__["visit"])(tree, "list", (node)=>{
                if (node.ordered) {
                    const start = node.start ?? 1;
                    node.children.forEach((child, index)=>{
                        child.label = index + start;
                    });
                }
            });
        });
withMeta(remarkAddOrderInListPlugin.plugin, {
    displayName: "Remark<remarkAddOrderInListPlugin>",
    group: "Remark"
});
withMeta(remarkAddOrderInListPlugin.options, {
    displayName: "RemarkConfig<remarkAddOrderInListPlugin>",
    group: "Remark"
});
const remarkLineBreak = (0, __TURBOPACK__imported__module__$5b$project$5d2f$RiderProjects$2f$SyriaHub$2f$node_modules$2f40$milkdown$2f$utils$2f$lib$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["$remark"])("remarkLineBreak", ()=>()=>(tree)=>{
            const find = /[\t ]*(?:\r?\n|\r)/g;
            (0, __TURBOPACK__imported__module__$5b$project$5d2f$RiderProjects$2f$SyriaHub$2f$node_modules$2f$unist$2d$util$2d$visit$2f$lib$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$locals$3e$__["visit"])(tree, "text", (node, index, parent)=>{
                if (!node.value || typeof node.value !== "string") return;
                const result = [];
                let start = 0;
                find.lastIndex = 0;
                let match = find.exec(node.value);
                while(match){
                    const position = match.index;
                    if (start !== position) result.push({
                        type: "text",
                        value: node.value.slice(start, position)
                    });
                    result.push({
                        type: "break",
                        data: {
                            isInline: true
                        }
                    });
                    start = position + match[0].length;
                    match = find.exec(node.value);
                }
                const hasResultAndIndex = result.length > 0 && parent && typeof index === "number";
                if (!hasResultAndIndex) return;
                if (start < node.value.length) result.push({
                    type: "text",
                    value: node.value.slice(start)
                });
                parent.children.splice(index, 1, ...result);
                return index + result.length;
            });
        });
withMeta(remarkLineBreak.plugin, {
    displayName: "Remark<remarkLineBreak>",
    group: "Remark"
});
withMeta(remarkLineBreak.options, {
    displayName: "RemarkConfig<remarkLineBreak>",
    group: "Remark"
});
const remarkInlineLinkPlugin = (0, __TURBOPACK__imported__module__$5b$project$5d2f$RiderProjects$2f$SyriaHub$2f$node_modules$2f40$milkdown$2f$utils$2f$lib$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["$remark"])("remarkInlineLink", ()=>__TURBOPACK__imported__module__$5b$project$5d2f$RiderProjects$2f$SyriaHub$2f$node_modules$2f$remark$2d$inline$2d$links$2f$lib$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"]);
withMeta(remarkInlineLinkPlugin.plugin, {
    displayName: "Remark<remarkInlineLinkPlugin>",
    group: "Remark"
});
withMeta(remarkInlineLinkPlugin.options, {
    displayName: "RemarkConfig<remarkInlineLinkPlugin>",
    group: "Remark"
});
const isParent = (node)=>!!node.children;
const isHTML = (node)=>node.type === "html";
function flatMapWithDepth(ast, fn) {
    return transform(ast, 0, null)[0];
    //TURBOPACK unreachable
    ;
    function transform(node, index, parent) {
        if (isParent(node)) {
            const out = [];
            for(let i = 0, n = node.children.length; i < n; i++){
                const nthChild = node.children[i];
                if (nthChild) {
                    const xs = transform(nthChild, i, node);
                    if (xs) {
                        for(let j = 0, m = xs.length; j < m; j++){
                            const item = xs[j];
                            if (item) out.push(item);
                        }
                    }
                }
            }
            node.children = out;
        }
        return fn(node, index, parent);
    }
}
const BLOCK_CONTAINER_TYPES = [
    "root",
    "blockquote",
    "listItem"
];
const remarkHtmlTransformer = (0, __TURBOPACK__imported__module__$5b$project$5d2f$RiderProjects$2f$SyriaHub$2f$node_modules$2f40$milkdown$2f$utils$2f$lib$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["$remark"])("remarkHTMLTransformer", ()=>()=>(tree)=>{
            flatMapWithDepth(tree, (node, _index, parent)=>{
                if (!isHTML(node)) return [
                    node
                ];
                if (parent && BLOCK_CONTAINER_TYPES.includes(parent.type)) {
                    node.children = [
                        {
                            ...node
                        }
                    ];
                    delete node.value;
                    node.type = "paragraph";
                }
                return [
                    node
                ];
            });
        });
withMeta(remarkHtmlTransformer.plugin, {
    displayName: "Remark<remarkHtmlTransformer>",
    group: "Remark"
});
withMeta(remarkHtmlTransformer.options, {
    displayName: "RemarkConfig<remarkHtmlTransformer>",
    group: "Remark"
});
const remarkMarker = (0, __TURBOPACK__imported__module__$5b$project$5d2f$RiderProjects$2f$SyriaHub$2f$node_modules$2f40$milkdown$2f$utils$2f$lib$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["$remark"])("remarkMarker", ()=>()=>(tree, file)=>{
            const getMarker = (node)=>{
                return file.value.charAt(node.position.start.offset);
            };
            (0, __TURBOPACK__imported__module__$5b$project$5d2f$RiderProjects$2f$SyriaHub$2f$node_modules$2f$unist$2d$util$2d$visit$2f$lib$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$locals$3e$__["visit"])(tree, (node)=>[
                    "strong",
                    "emphasis"
                ].includes(node.type), (node)=>{
                node.marker = getMarker(node);
            });
        });
withMeta(remarkMarker.plugin, {
    displayName: "Remark<remarkMarker>",
    group: "Remark"
});
withMeta(remarkMarker.options, {
    displayName: "RemarkConfig<remarkMarker>",
    group: "Remark"
});
const inlineNodesCursorPlugin = (0, __TURBOPACK__imported__module__$5b$project$5d2f$RiderProjects$2f$SyriaHub$2f$node_modules$2f40$milkdown$2f$utils$2f$lib$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["$prose"])(()=>{
    let lock = false;
    const inlineNodesCursorPluginKey = new __TURBOPACK__imported__module__$5b$project$5d2f$RiderProjects$2f$SyriaHub$2f$node_modules$2f$prosemirror$2d$state$2f$dist$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["PluginKey"]("MILKDOWN_INLINE_NODES_CURSOR");
    const inlineNodesCursorPlugin2 = new __TURBOPACK__imported__module__$5b$project$5d2f$RiderProjects$2f$SyriaHub$2f$node_modules$2f$prosemirror$2d$state$2f$dist$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Plugin"]({
        key: inlineNodesCursorPluginKey,
        state: {
            init () {
                return false;
            },
            apply (tr) {
                if (!tr.selection.empty) return false;
                const pos = tr.selection.$from;
                const left = pos.nodeBefore;
                const right = pos.nodeAfter;
                if (left && right && left.isInline && !left.isText && right.isInline && !right.isText) return true;
                return false;
            }
        },
        props: {
            handleDOMEvents: {
                compositionend: (view, e)=>{
                    if (lock) {
                        lock = false;
                        requestAnimationFrame(()=>{
                            const active = inlineNodesCursorPlugin2.getState(view.state);
                            if (active) {
                                const from = view.state.selection.from;
                                e.preventDefault();
                                view.dispatch(view.state.tr.insertText(e.data || "", from));
                            }
                        });
                        return true;
                    }
                    return false;
                },
                compositionstart: (view)=>{
                    const active = inlineNodesCursorPlugin2.getState(view.state);
                    if (active) lock = true;
                    return false;
                },
                beforeinput: (view, e)=>{
                    const active = inlineNodesCursorPlugin2.getState(view.state);
                    if (active && e instanceof InputEvent && e.data && !lock) {
                        const from = view.state.selection.from;
                        e.preventDefault();
                        view.dispatch(view.state.tr.insertText(e.data || "", from));
                        return true;
                    }
                    return false;
                }
            },
            decorations (state) {
                const active = inlineNodesCursorPlugin2.getState(state);
                if (active) {
                    const pos = state.selection.$from;
                    const position = pos.pos;
                    const left = document.createElement("span");
                    const leftDec = __TURBOPACK__imported__module__$5b$project$5d2f$RiderProjects$2f$SyriaHub$2f$node_modules$2f$prosemirror$2d$view$2f$dist$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Decoration"].widget(position, left, {
                        side: -1
                    });
                    const right = document.createElement("span");
                    const rightDec = __TURBOPACK__imported__module__$5b$project$5d2f$RiderProjects$2f$SyriaHub$2f$node_modules$2f$prosemirror$2d$view$2f$dist$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Decoration"].widget(position, right);
                    setTimeout(()=>{
                        left.contentEditable = "true";
                        right.contentEditable = "true";
                    });
                    return __TURBOPACK__imported__module__$5b$project$5d2f$RiderProjects$2f$SyriaHub$2f$node_modules$2f$prosemirror$2d$view$2f$dist$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["DecorationSet"].create(state.doc, [
                        leftDec,
                        rightDec
                    ]);
                }
                return __TURBOPACK__imported__module__$5b$project$5d2f$RiderProjects$2f$SyriaHub$2f$node_modules$2f$prosemirror$2d$view$2f$dist$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["DecorationSet"].empty;
            }
        }
    });
    return inlineNodesCursorPlugin2;
});
withMeta(inlineNodesCursorPlugin, {
    displayName: "Prose<inlineNodesCursorPlugin>",
    group: "Prose"
});
const hardbreakClearMarkPlugin = (0, __TURBOPACK__imported__module__$5b$project$5d2f$RiderProjects$2f$SyriaHub$2f$node_modules$2f40$milkdown$2f$utils$2f$lib$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["$prose"])((ctx)=>{
    return new __TURBOPACK__imported__module__$5b$project$5d2f$RiderProjects$2f$SyriaHub$2f$node_modules$2f$prosemirror$2d$state$2f$dist$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Plugin"]({
        key: new __TURBOPACK__imported__module__$5b$project$5d2f$RiderProjects$2f$SyriaHub$2f$node_modules$2f$prosemirror$2d$state$2f$dist$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["PluginKey"]("MILKDOWN_HARDBREAK_MARKS"),
        appendTransaction: (trs, _oldState, newState)=>{
            if (!trs.length) return;
            const [tr] = trs;
            if (!tr) return;
            const [step] = tr.steps;
            const isInsertHr = tr.getMeta("hardbreak");
            if (isInsertHr) {
                if (!(step instanceof __TURBOPACK__imported__module__$5b$project$5d2f$RiderProjects$2f$SyriaHub$2f$node_modules$2f$prosemirror$2d$transform$2f$dist$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["ReplaceStep"])) return;
                const { from } = step;
                return newState.tr.setNodeMarkup(from, hardbreakSchema.type(ctx), void 0, []);
            }
            const isAddMarkStep = step instanceof __TURBOPACK__imported__module__$5b$project$5d2f$RiderProjects$2f$SyriaHub$2f$node_modules$2f$prosemirror$2d$transform$2f$dist$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["AddMarkStep"];
            if (isAddMarkStep) {
                let _tr = newState.tr;
                const { from, to } = step;
                newState.doc.nodesBetween(from, to, (node, pos)=>{
                    if (node.type === hardbreakSchema.type(ctx)) _tr = _tr.setNodeMarkup(pos, hardbreakSchema.type(ctx), void 0, []);
                });
                return _tr;
            }
            return void 0;
        }
    });
});
withMeta(hardbreakClearMarkPlugin, {
    displayName: "Prose<hardbreakClearMarkPlugin>",
    group: "Prose"
});
const hardbreakFilterNodes = (0, __TURBOPACK__imported__module__$5b$project$5d2f$RiderProjects$2f$SyriaHub$2f$node_modules$2f40$milkdown$2f$utils$2f$lib$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["$ctx"])([
    "table",
    "code_block"
], "hardbreakFilterNodes");
withMeta(hardbreakFilterNodes, {
    displayName: "Ctx<hardbreakFilterNodes>",
    group: "Prose"
});
const hardbreakFilterPlugin = (0, __TURBOPACK__imported__module__$5b$project$5d2f$RiderProjects$2f$SyriaHub$2f$node_modules$2f40$milkdown$2f$utils$2f$lib$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["$prose"])((ctx)=>{
    const notIn = ctx.get(hardbreakFilterNodes.key);
    return new __TURBOPACK__imported__module__$5b$project$5d2f$RiderProjects$2f$SyriaHub$2f$node_modules$2f$prosemirror$2d$state$2f$dist$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Plugin"]({
        key: new __TURBOPACK__imported__module__$5b$project$5d2f$RiderProjects$2f$SyriaHub$2f$node_modules$2f$prosemirror$2d$state$2f$dist$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["PluginKey"]("MILKDOWN_HARDBREAK_FILTER"),
        filterTransaction: (tr, state)=>{
            const isInsertHr = tr.getMeta("hardbreak");
            const [step] = tr.steps;
            if (isInsertHr && step) {
                const { from } = step;
                const $from = state.doc.resolve(from);
                let curDepth = $from.depth;
                let canApply = true;
                while(curDepth > 0){
                    if (notIn.includes($from.node(curDepth).type.name)) canApply = false;
                    curDepth--;
                }
                return canApply;
            }
            return true;
        }
    });
});
withMeta(hardbreakFilterPlugin, {
    displayName: "Prose<hardbreakFilterPlugin>",
    group: "Prose"
});
const syncHeadingIdPlugin = (0, __TURBOPACK__imported__module__$5b$project$5d2f$RiderProjects$2f$SyriaHub$2f$node_modules$2f40$milkdown$2f$utils$2f$lib$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["$prose"])((ctx)=>{
    const headingIdPluginKey = new __TURBOPACK__imported__module__$5b$project$5d2f$RiderProjects$2f$SyriaHub$2f$node_modules$2f$prosemirror$2d$state$2f$dist$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["PluginKey"]("MILKDOWN_HEADING_ID");
    const updateId = (view)=>{
        if (view.composing) return;
        const getId = ctx.get(headingIdGenerator.key);
        const tr = view.state.tr.setMeta("addToHistory", false);
        let found = false;
        const idMap = {};
        view.state.doc.descendants((node, pos)=>{
            if (node.type === headingSchema.type(ctx)) {
                if (node.textContent.trim().length === 0) return;
                const attrs = node.attrs;
                let id = getId(node);
                if (idMap[id]) {
                    idMap[id] += 1;
                    id += `-#${idMap[id]}`;
                } else {
                    idMap[id] = 1;
                }
                if (attrs.id !== id) {
                    found = true;
                    tr.setMeta(headingIdPluginKey, true).setNodeMarkup(pos, void 0, {
                        ...attrs,
                        id
                    });
                }
            }
        });
        if (found) view.dispatch(tr);
    };
    return new __TURBOPACK__imported__module__$5b$project$5d2f$RiderProjects$2f$SyriaHub$2f$node_modules$2f$prosemirror$2d$state$2f$dist$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Plugin"]({
        key: headingIdPluginKey,
        view: (view)=>{
            updateId(view);
            return {
                update: (view2, prevState)=>{
                    if (view2.state.doc.eq(prevState.doc)) return;
                    updateId(view2);
                }
            };
        }
    });
});
withMeta(syncHeadingIdPlugin, {
    displayName: "Prose<syncHeadingIdPlugin>",
    group: "Prose"
});
const syncListOrderPlugin = (0, __TURBOPACK__imported__module__$5b$project$5d2f$RiderProjects$2f$SyriaHub$2f$node_modules$2f40$milkdown$2f$utils$2f$lib$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["$prose"])((ctx)=>{
    const syncOrderLabel = (transactions, _oldState, newState)=>{
        if (!newState.selection || transactions.some((tr2)=>tr2.getMeta("addToHistory") === false || !tr2.isGeneric)) return null;
        const orderedListType = orderedListSchema.type(ctx);
        const bulletListType = bulletListSchema.type(ctx);
        const listItemType = listItemSchema.type(ctx);
        const handleNodeItem = (attrs, index)=>{
            let changed = false;
            const expectedLabel = `${index + 1}.`;
            if (attrs.label !== expectedLabel) {
                attrs.label = expectedLabel;
                changed = true;
            }
            return changed;
        };
        let tr = newState.tr;
        let needDispatch = false;
        newState.doc.descendants((node, pos, parent, index)=>{
            if (node.type === bulletListType) {
                const base = node.maybeChild(0);
                if (base?.type === listItemType && base.attrs.listType === "ordered") {
                    needDispatch = true;
                    tr.setNodeMarkup(pos, orderedListType, {
                        spread: "true"
                    });
                    node.descendants((child, pos2, _parent, index2)=>{
                        if (child.type === listItemType) {
                            const attrs = {
                                ...child.attrs
                            };
                            const changed = handleNodeItem(attrs, index2);
                            if (changed) tr = tr.setNodeMarkup(pos2, void 0, attrs);
                        }
                        return false;
                    });
                }
            } else if (node.type === listItemType && parent?.type === orderedListType) {
                const attrs = {
                    ...node.attrs
                };
                let changed = false;
                if (attrs.listType !== "ordered") {
                    attrs.listType = "ordered";
                    changed = true;
                }
                const base = parent?.maybeChild(0);
                if (base) changed = handleNodeItem(attrs, index);
                if (changed) {
                    tr = tr.setNodeMarkup(pos, void 0, attrs);
                    needDispatch = true;
                }
            }
        });
        return needDispatch ? tr.setMeta("addToHistory", false) : null;
    };
    return new __TURBOPACK__imported__module__$5b$project$5d2f$RiderProjects$2f$SyriaHub$2f$node_modules$2f$prosemirror$2d$state$2f$dist$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Plugin"]({
        key: new __TURBOPACK__imported__module__$5b$project$5d2f$RiderProjects$2f$SyriaHub$2f$node_modules$2f$prosemirror$2d$state$2f$dist$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["PluginKey"]("MILKDOWN_KEEP_LIST_ORDER"),
        appendTransaction: syncOrderLabel
    });
});
withMeta(syncListOrderPlugin, {
    displayName: "Prose<syncListOrderPlugin>",
    group: "Prose"
});
const plugins = [
    hardbreakClearMarkPlugin,
    hardbreakFilterNodes,
    hardbreakFilterPlugin,
    inlineNodesCursorPlugin,
    remarkAddOrderInListPlugin,
    remarkInlineLinkPlugin,
    remarkLineBreak,
    remarkHtmlTransformer,
    remarkMarker,
    remarkPreserveEmptyLinePlugin,
    syncHeadingIdPlugin,
    syncListOrderPlugin
].flat();
const commonmark = [
    schema,
    inputRules,
    markInputRules,
    commands,
    keymap,
    plugins
].flat();
;
 //# sourceMappingURL=index.js.map
}),
"[project]/RiderProjects/SyriaHub/node_modules/@milkdown/preset-gfm/lib/index.js [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "addColAfterCommand",
    ()=>addColAfterCommand,
    "addColBeforeCommand",
    ()=>addColBeforeCommand,
    "addRowAfterCommand",
    ()=>addRowAfterCommand,
    "addRowBeforeCommand",
    ()=>addRowBeforeCommand,
    "addRowWithAlignment",
    ()=>addRowWithAlignment,
    "autoInsertSpanPlugin",
    ()=>autoInsertSpanPlugin,
    "columnResizingPlugin",
    ()=>columnResizingPlugin,
    "commands",
    ()=>commands,
    "createTable",
    ()=>createTable,
    "deleteSelectedCellsCommand",
    ()=>deleteSelectedCellsCommand,
    "exitTable",
    ()=>exitTable,
    "extendListItemSchemaForTask",
    ()=>extendListItemSchemaForTask,
    "footnoteDefinitionSchema",
    ()=>footnoteDefinitionSchema,
    "footnoteReferenceSchema",
    ()=>footnoteReferenceSchema,
    "getAllCellsInTable",
    ()=>getAllCellsInTable,
    "getCellsInCol",
    ()=>getCellsInCol,
    "getCellsInRow",
    ()=>getCellsInRow,
    "gfm",
    ()=>gfm,
    "goToNextTableCellCommand",
    ()=>goToNextTableCellCommand,
    "goToPrevTableCellCommand",
    ()=>goToPrevTableCellCommand,
    "inputRules",
    ()=>inputRules,
    "insertTableCommand",
    ()=>insertTableCommand,
    "insertTableInputRule",
    ()=>insertTableInputRule,
    "keepTableAlignPlugin",
    ()=>keepTableAlignPlugin,
    "keymap",
    ()=>keymap,
    "markInputRules",
    ()=>markInputRules,
    "moveColCommand",
    ()=>moveColCommand,
    "moveRowCommand",
    ()=>moveRowCommand,
    "pasteRules",
    ()=>pasteRules,
    "plugins",
    ()=>plugins,
    "remarkGFMPlugin",
    ()=>remarkGFMPlugin,
    "schema",
    ()=>schema,
    "selectCol",
    ()=>selectCol,
    "selectColCommand",
    ()=>selectColCommand,
    "selectLine",
    ()=>selectLine,
    "selectRow",
    ()=>selectRow,
    "selectRowCommand",
    ()=>selectRowCommand,
    "selectTable",
    ()=>selectTable,
    "selectTableCommand",
    ()=>selectTableCommand,
    "setAlignCommand",
    ()=>setAlignCommand,
    "strikethroughAttr",
    ()=>strikethroughAttr,
    "strikethroughInputRule",
    ()=>strikethroughInputRule,
    "strikethroughKeymap",
    ()=>strikethroughKeymap,
    "strikethroughSchema",
    ()=>strikethroughSchema,
    "tableCellSchema",
    ()=>tableCellSchema,
    "tableEditingPlugin",
    ()=>tableEditingPlugin,
    "tableHeaderRowSchema",
    ()=>tableHeaderRowSchema,
    "tableHeaderSchema",
    ()=>tableHeaderSchema,
    "tableKeymap",
    ()=>tableKeymap,
    "tablePasteRule",
    ()=>tablePasteRule,
    "tableRowSchema",
    ()=>tableRowSchema,
    "tableSchema",
    ()=>tableSchema,
    "toggleStrikethroughCommand",
    ()=>toggleStrikethroughCommand,
    "wrapInTaskListInputRule",
    ()=>wrapInTaskListInputRule
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$RiderProjects$2f$SyriaHub$2f$node_modules$2f40$milkdown$2f$exception$2f$lib$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/RiderProjects/SyriaHub/node_modules/@milkdown/exception/lib/index.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$RiderProjects$2f$SyriaHub$2f$node_modules$2f40$milkdown$2f$preset$2d$commonmark$2f$lib$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/RiderProjects/SyriaHub/node_modules/@milkdown/preset-commonmark/lib/index.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$RiderProjects$2f$SyriaHub$2f$node_modules$2f$prosemirror$2d$inputrules$2f$dist$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/RiderProjects/SyriaHub/node_modules/prosemirror-inputrules/dist/index.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$RiderProjects$2f$SyriaHub$2f$node_modules$2f40$milkdown$2f$utils$2f$lib$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/RiderProjects/SyriaHub/node_modules/@milkdown/utils/lib/index.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$RiderProjects$2f$SyriaHub$2f$node_modules$2f$prosemirror$2d$tables$2f$dist$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/RiderProjects/SyriaHub/node_modules/prosemirror-tables/dist/index.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$RiderProjects$2f$SyriaHub$2f$node_modules$2f40$milkdown$2f$core$2f$lib$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/RiderProjects/SyriaHub/node_modules/@milkdown/core/lib/index.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$RiderProjects$2f$SyriaHub$2f$node_modules$2f40$milkdown$2f$prose$2f$lib$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/RiderProjects/SyriaHub/node_modules/@milkdown/prose/lib/index.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$RiderProjects$2f$SyriaHub$2f$node_modules$2f$prosemirror$2d$commands$2f$dist$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/RiderProjects/SyriaHub/node_modules/prosemirror-commands/dist/index.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$RiderProjects$2f$SyriaHub$2f$node_modules$2f$prosemirror$2d$model$2f$dist$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/RiderProjects/SyriaHub/node_modules/prosemirror-model/dist/index.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$RiderProjects$2f$SyriaHub$2f$node_modules$2f$prosemirror$2d$state$2f$dist$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/RiderProjects/SyriaHub/node_modules/prosemirror-state/dist/index.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$RiderProjects$2f$SyriaHub$2f$node_modules$2f$prosemirror$2d$safari$2d$ime$2d$span$2f$dist$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/RiderProjects/SyriaHub/node_modules/prosemirror-safari-ime-span/dist/index.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$RiderProjects$2f$SyriaHub$2f$node_modules$2f$remark$2d$gfm$2f$lib$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/RiderProjects/SyriaHub/node_modules/remark-gfm/lib/index.js [app-client] (ecmascript)");
;
;
;
;
;
;
;
;
;
;
;
;
function withMeta(plugin, meta) {
    Object.assign(plugin, {
        meta: {
            package: "@milkdown/preset-gfm",
            ...meta
        }
    });
    return plugin;
}
const strikethroughAttr = (0, __TURBOPACK__imported__module__$5b$project$5d2f$RiderProjects$2f$SyriaHub$2f$node_modules$2f40$milkdown$2f$utils$2f$lib$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["$markAttr"])("strike_through");
withMeta(strikethroughAttr, {
    displayName: "Attr<strikethrough>",
    group: "Strikethrough"
});
const strikethroughSchema = (0, __TURBOPACK__imported__module__$5b$project$5d2f$RiderProjects$2f$SyriaHub$2f$node_modules$2f40$milkdown$2f$utils$2f$lib$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["$markSchema"])("strike_through", (ctx)=>({
        parseDOM: [
            {
                tag: "del"
            },
            {
                style: "text-decoration",
                getAttrs: (value)=>value === "line-through"
            }
        ],
        toDOM: (mark)=>[
                "del",
                ctx.get(strikethroughAttr.key)(mark)
            ],
        parseMarkdown: {
            match: (node)=>node.type === "delete",
            runner: (state, node, markType)=>{
                state.openMark(markType);
                state.next(node.children);
                state.closeMark(markType);
            }
        },
        toMarkdown: {
            match: (mark)=>mark.type.name === "strike_through",
            runner: (state, mark)=>{
                state.withMark(mark, "delete");
            }
        }
    }));
withMeta(strikethroughSchema.mark, {
    displayName: "MarkSchema<strikethrough>",
    group: "Strikethrough"
});
withMeta(strikethroughSchema.ctx, {
    displayName: "MarkSchemaCtx<strikethrough>",
    group: "Strikethrough"
});
const toggleStrikethroughCommand = (0, __TURBOPACK__imported__module__$5b$project$5d2f$RiderProjects$2f$SyriaHub$2f$node_modules$2f40$milkdown$2f$utils$2f$lib$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["$command"])("ToggleStrikeThrough", (ctx)=>()=>{
        return (0, __TURBOPACK__imported__module__$5b$project$5d2f$RiderProjects$2f$SyriaHub$2f$node_modules$2f$prosemirror$2d$commands$2f$dist$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["toggleMark"])(strikethroughSchema.type(ctx));
    });
withMeta(toggleStrikethroughCommand, {
    displayName: "Command<ToggleStrikethrough>",
    group: "Strikethrough"
});
const strikethroughInputRule = (0, __TURBOPACK__imported__module__$5b$project$5d2f$RiderProjects$2f$SyriaHub$2f$node_modules$2f40$milkdown$2f$utils$2f$lib$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["$inputRule"])((ctx)=>{
    return (0, __TURBOPACK__imported__module__$5b$project$5d2f$RiderProjects$2f$SyriaHub$2f$node_modules$2f40$milkdown$2f$prose$2f$lib$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["markRule"])(new RegExp("(?<![\\w:/])(~{1,2})(.+?)\\1(?!\\w|\\/)"), strikethroughSchema.type(ctx));
});
withMeta(strikethroughInputRule, {
    displayName: "InputRule<strikethrough>",
    group: "Strikethrough"
});
const strikethroughKeymap = (0, __TURBOPACK__imported__module__$5b$project$5d2f$RiderProjects$2f$SyriaHub$2f$node_modules$2f40$milkdown$2f$utils$2f$lib$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["$useKeymap"])("strikeThroughKeymap", {
    ToggleStrikethrough: {
        shortcuts: "Mod-Alt-x",
        command: (ctx)=>{
            const commands2 = ctx.get(__TURBOPACK__imported__module__$5b$project$5d2f$RiderProjects$2f$SyriaHub$2f$node_modules$2f40$milkdown$2f$core$2f$lib$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["commandsCtx"]);
            return ()=>commands2.call(toggleStrikethroughCommand.key);
        }
    }
});
withMeta(strikethroughKeymap.ctx, {
    displayName: "KeymapCtx<strikethrough>",
    group: "Strikethrough"
});
withMeta(strikethroughKeymap.shortcuts, {
    displayName: "Keymap<strikethrough>",
    group: "Strikethrough"
});
const originalSchema = (0, __TURBOPACK__imported__module__$5b$project$5d2f$RiderProjects$2f$SyriaHub$2f$node_modules$2f$prosemirror$2d$tables$2f$dist$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["tableNodes"])({
    tableGroup: "block",
    cellContent: "paragraph",
    cellAttributes: {
        alignment: {
            default: "left",
            getFromDOM: (dom)=>dom.style.textAlign || "left",
            setDOMAttr: (value, attrs)=>{
                attrs.style = `text-align: ${value || "left"}`;
            }
        }
    }
});
const tableSchema = (0, __TURBOPACK__imported__module__$5b$project$5d2f$RiderProjects$2f$SyriaHub$2f$node_modules$2f40$milkdown$2f$utils$2f$lib$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["$nodeSchema"])("table", ()=>({
        ...originalSchema.table,
        content: "table_header_row table_row+",
        disableDropCursor: true,
        parseMarkdown: {
            match: (node)=>node.type === "table",
            runner: (state, node, type)=>{
                const align = node.align;
                const children = node.children.map((x, i)=>({
                        ...x,
                        align,
                        isHeader: i === 0
                    }));
                state.openNode(type);
                state.next(children);
                state.closeNode();
            }
        },
        toMarkdown: {
            match: (node)=>node.type.name === "table",
            runner: (state, node)=>{
                const firstLine = node.content.firstChild?.content;
                if (!firstLine) return;
                const align = [];
                firstLine.forEach((cell)=>{
                    align.push(cell.attrs.alignment);
                });
                state.openNode("table", void 0, {
                    align
                });
                state.next(node.content);
                state.closeNode();
            }
        }
    }));
withMeta(tableSchema.node, {
    displayName: "NodeSchema<table>",
    group: "Table"
});
withMeta(tableSchema.ctx, {
    displayName: "NodeSchemaCtx<table>",
    group: "Table"
});
const tableHeaderRowSchema = (0, __TURBOPACK__imported__module__$5b$project$5d2f$RiderProjects$2f$SyriaHub$2f$node_modules$2f40$milkdown$2f$utils$2f$lib$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["$nodeSchema"])("table_header_row", ()=>({
        ...originalSchema.table_row,
        disableDropCursor: true,
        content: "(table_header)*",
        parseDOM: [
            {
                tag: "tr[data-is-header]"
            }
        ],
        toDOM () {
            return [
                "tr",
                {
                    "data-is-header": true
                },
                0
            ];
        },
        parseMarkdown: {
            match: (node)=>Boolean(node.type === "tableRow" && node.isHeader),
            runner: (state, node, type)=>{
                const align = node.align;
                const children = node.children.map((x, i)=>({
                        ...x,
                        align: align[i],
                        isHeader: node.isHeader
                    }));
                state.openNode(type);
                state.next(children);
                state.closeNode();
            }
        },
        toMarkdown: {
            match: (node)=>node.type.name === "table_header_row",
            runner: (state, node)=>{
                state.openNode("tableRow", void 0, {
                    isHeader: true
                });
                state.next(node.content);
                state.closeNode();
            }
        }
    }));
withMeta(tableHeaderRowSchema.node, {
    displayName: "NodeSchema<tableHeaderRow>",
    group: "Table"
});
withMeta(tableHeaderRowSchema.ctx, {
    displayName: "NodeSchemaCtx<tableHeaderRow>",
    group: "Table"
});
const tableRowSchema = (0, __TURBOPACK__imported__module__$5b$project$5d2f$RiderProjects$2f$SyriaHub$2f$node_modules$2f40$milkdown$2f$utils$2f$lib$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["$nodeSchema"])("table_row", ()=>({
        ...originalSchema.table_row,
        disableDropCursor: true,
        content: "(table_cell)*",
        parseMarkdown: {
            match: (node)=>node.type === "tableRow",
            runner: (state, node, type)=>{
                const align = node.align;
                const children = node.children.map((x, i)=>({
                        ...x,
                        align: align[i]
                    }));
                state.openNode(type);
                state.next(children);
                state.closeNode();
            }
        },
        toMarkdown: {
            match: (node)=>node.type.name === "table_row",
            runner: (state, node)=>{
                if (node.content.size === 0) {
                    return;
                }
                state.openNode("tableRow");
                state.next(node.content);
                state.closeNode();
            }
        }
    }));
withMeta(tableRowSchema.node, {
    displayName: "NodeSchema<tableRow>",
    group: "Table"
});
withMeta(tableRowSchema.ctx, {
    displayName: "NodeSchemaCtx<tableRow>",
    group: "Table"
});
const tableCellSchema = (0, __TURBOPACK__imported__module__$5b$project$5d2f$RiderProjects$2f$SyriaHub$2f$node_modules$2f40$milkdown$2f$utils$2f$lib$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["$nodeSchema"])("table_cell", ()=>({
        ...originalSchema.table_cell,
        disableDropCursor: true,
        parseMarkdown: {
            match: (node)=>node.type === "tableCell" && !node.isHeader,
            runner: (state, node, type)=>{
                const align = node.align;
                state.openNode(type, {
                    alignment: align
                }).openNode(state.schema.nodes.paragraph).next(node.children).closeNode().closeNode();
            }
        },
        toMarkdown: {
            match: (node)=>node.type.name === "table_cell",
            runner: (state, node)=>{
                state.openNode("tableCell").next(node.content).closeNode();
            }
        }
    }));
withMeta(tableCellSchema.node, {
    displayName: "NodeSchema<tableCell>",
    group: "Table"
});
withMeta(tableCellSchema.ctx, {
    displayName: "NodeSchemaCtx<tableCell>",
    group: "Table"
});
const tableHeaderSchema = (0, __TURBOPACK__imported__module__$5b$project$5d2f$RiderProjects$2f$SyriaHub$2f$node_modules$2f40$milkdown$2f$utils$2f$lib$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["$nodeSchema"])("table_header", ()=>({
        ...originalSchema.table_header,
        disableDropCursor: true,
        parseMarkdown: {
            match: (node)=>node.type === "tableCell" && !!node.isHeader,
            runner: (state, node, type)=>{
                const align = node.align;
                state.openNode(type, {
                    alignment: align
                });
                state.openNode(state.schema.nodes.paragraph);
                state.next(node.children);
                state.closeNode();
                state.closeNode();
            }
        },
        toMarkdown: {
            match: (node)=>node.type.name === "table_header",
            runner: (state, node)=>{
                state.openNode("tableCell");
                state.next(node.content);
                state.closeNode();
            }
        }
    }));
withMeta(tableHeaderSchema.node, {
    displayName: "NodeSchema<tableHeader>",
    group: "Table"
});
withMeta(tableHeaderSchema.ctx, {
    displayName: "NodeSchemaCtx<tableHeader>",
    group: "Table"
});
function createTable(ctx, rowsCount = 3, colsCount = 3) {
    const cells = Array(colsCount).fill(0).map(()=>tableCellSchema.type(ctx).createAndFill());
    const headerCells = Array(colsCount).fill(0).map(()=>tableHeaderSchema.type(ctx).createAndFill());
    const rows = Array(rowsCount).fill(0).map((_, i)=>i === 0 ? tableHeaderRowSchema.type(ctx).create(null, headerCells) : tableRowSchema.type(ctx).create(null, cells));
    return tableSchema.type(ctx).create(null, rows);
}
function getCellsInCol(columnIndexes, selection) {
    const table = (0, __TURBOPACK__imported__module__$5b$project$5d2f$RiderProjects$2f$SyriaHub$2f$node_modules$2f$prosemirror$2d$tables$2f$dist$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["findTable"])(selection.$from);
    if (!table) return void 0;
    const map = __TURBOPACK__imported__module__$5b$project$5d2f$RiderProjects$2f$SyriaHub$2f$node_modules$2f$prosemirror$2d$tables$2f$dist$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["TableMap"].get(table.node);
    const indexes = Array.isArray(columnIndexes) ? columnIndexes : [
        columnIndexes
    ];
    return indexes.filter((index)=>index >= 0 && index <= map.width - 1).flatMap((index)=>{
        const cells = map.cellsInRect({
            left: index,
            right: index + 1,
            top: 0,
            bottom: map.height
        });
        return cells.map((nodePos)=>{
            const node = table.node.nodeAt(nodePos);
            const pos = nodePos + table.start;
            return {
                pos,
                start: pos + 1,
                node,
                depth: table.depth + 2
            };
        });
    });
}
function getCellsInRow(rowIndex, selection) {
    const table = (0, __TURBOPACK__imported__module__$5b$project$5d2f$RiderProjects$2f$SyriaHub$2f$node_modules$2f$prosemirror$2d$tables$2f$dist$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["findTable"])(selection.$from);
    if (!table) {
        return;
    }
    const map = __TURBOPACK__imported__module__$5b$project$5d2f$RiderProjects$2f$SyriaHub$2f$node_modules$2f$prosemirror$2d$tables$2f$dist$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["TableMap"].get(table.node);
    const indexes = Array.isArray(rowIndex) ? rowIndex : [
        rowIndex
    ];
    return indexes.filter((index)=>index >= 0 && index <= map.height - 1).flatMap((index)=>{
        const cells = map.cellsInRect({
            left: 0,
            right: map.width,
            top: index,
            bottom: index + 1
        });
        return cells.map((nodePos)=>{
            const node = table.node.nodeAt(nodePos);
            const pos = nodePos + table.start;
            return {
                pos,
                start: pos + 1,
                node,
                depth: table.depth + 2
            };
        });
    });
}
function selectLine(type) {
    return (index, pos)=>(tr)=>{
            pos = pos ?? tr.selection.from;
            const $pos = tr.doc.resolve(pos);
            const $node = (0, __TURBOPACK__imported__module__$5b$project$5d2f$RiderProjects$2f$SyriaHub$2f$node_modules$2f40$milkdown$2f$prose$2f$lib$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["findParentNodeClosestToPos"])((node)=>node.type.name === "table")($pos);
            const table = $node ? {
                node: $node.node,
                from: $node.start
            } : void 0;
            const isRowSelection = type === "row";
            if (table) {
                const map = __TURBOPACK__imported__module__$5b$project$5d2f$RiderProjects$2f$SyriaHub$2f$node_modules$2f$prosemirror$2d$tables$2f$dist$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["TableMap"].get(table.node);
                if (index >= 0 && index < (isRowSelection ? map.height : map.width)) {
                    const lastCell = map.positionAt(isRowSelection ? index : map.height - 1, isRowSelection ? map.width - 1 : index, table.node);
                    const $lastCell = tr.doc.resolve(table.from + lastCell);
                    const createCellSelection = isRowSelection ? __TURBOPACK__imported__module__$5b$project$5d2f$RiderProjects$2f$SyriaHub$2f$node_modules$2f$prosemirror$2d$tables$2f$dist$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["CellSelection"].rowSelection : __TURBOPACK__imported__module__$5b$project$5d2f$RiderProjects$2f$SyriaHub$2f$node_modules$2f$prosemirror$2d$tables$2f$dist$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["CellSelection"].colSelection;
                    const firstCell = map.positionAt(isRowSelection ? index : 0, isRowSelection ? 0 : index, table.node);
                    const $firstCell = tr.doc.resolve(table.from + firstCell);
                    return (0, __TURBOPACK__imported__module__$5b$project$5d2f$RiderProjects$2f$SyriaHub$2f$node_modules$2f40$milkdown$2f$prose$2f$lib$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["cloneTr"])(tr.setSelection(createCellSelection($lastCell, $firstCell)));
                }
            }
            return tr;
        };
}
const selectRow = selectLine("row");
const selectCol = selectLine("col");
function addRowWithAlignment(ctx, tr, { map, tableStart, table }, row) {
    const rowPos = Array(row).fill(0).reduce((acc, _, i)=>{
        return acc + table.child(i).nodeSize;
    }, tableStart);
    const cells = Array(map.width).fill(0).map((_, col)=>{
        const headerCol = table.nodeAt(map.map[col]);
        return tableCellSchema.type(ctx).createAndFill({
            alignment: headerCol?.attrs.alignment
        });
    });
    tr.insert(rowPos, tableRowSchema.type(ctx).create(null, cells));
    return tr;
}
function getAllCellsInTable(selection) {
    const table = (0, __TURBOPACK__imported__module__$5b$project$5d2f$RiderProjects$2f$SyriaHub$2f$node_modules$2f$prosemirror$2d$tables$2f$dist$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["findTable"])(selection.$from);
    if (!table) return;
    const map = __TURBOPACK__imported__module__$5b$project$5d2f$RiderProjects$2f$SyriaHub$2f$node_modules$2f$prosemirror$2d$tables$2f$dist$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["TableMap"].get(table.node);
    const cells = map.cellsInRect({
        left: 0,
        right: map.width,
        top: 0,
        bottom: map.height
    });
    return cells.map((nodePos)=>{
        const node = table.node.nodeAt(nodePos);
        const pos = nodePos + table.start;
        return {
            pos,
            start: pos + 1,
            node
        };
    });
}
function selectTable(tr) {
    const cells = getAllCellsInTable(tr.selection);
    if (cells && cells[0]) {
        const $firstCell = tr.doc.resolve(cells[0].pos);
        const last = cells[cells.length - 1];
        if (last) {
            const $lastCell = tr.doc.resolve(last.pos);
            return (0, __TURBOPACK__imported__module__$5b$project$5d2f$RiderProjects$2f$SyriaHub$2f$node_modules$2f40$milkdown$2f$prose$2f$lib$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["cloneTr"])(tr.setSelection(new __TURBOPACK__imported__module__$5b$project$5d2f$RiderProjects$2f$SyriaHub$2f$node_modules$2f$prosemirror$2d$tables$2f$dist$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["CellSelection"]($lastCell, $firstCell)));
        }
    }
    return tr;
}
const goToPrevTableCellCommand = (0, __TURBOPACK__imported__module__$5b$project$5d2f$RiderProjects$2f$SyriaHub$2f$node_modules$2f40$milkdown$2f$utils$2f$lib$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["$command"])("GoToPrevTableCell", ()=>()=>(0, __TURBOPACK__imported__module__$5b$project$5d2f$RiderProjects$2f$SyriaHub$2f$node_modules$2f$prosemirror$2d$tables$2f$dist$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["goToNextCell"])(-1));
withMeta(goToPrevTableCellCommand, {
    displayName: "Command<goToPrevTableCellCommand>",
    group: "Table"
});
const goToNextTableCellCommand = (0, __TURBOPACK__imported__module__$5b$project$5d2f$RiderProjects$2f$SyriaHub$2f$node_modules$2f40$milkdown$2f$utils$2f$lib$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["$command"])("GoToNextTableCell", ()=>()=>(0, __TURBOPACK__imported__module__$5b$project$5d2f$RiderProjects$2f$SyriaHub$2f$node_modules$2f$prosemirror$2d$tables$2f$dist$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["goToNextCell"])(1));
withMeta(goToNextTableCellCommand, {
    displayName: "Command<goToNextTableCellCommand>",
    group: "Table"
});
const exitTable = (0, __TURBOPACK__imported__module__$5b$project$5d2f$RiderProjects$2f$SyriaHub$2f$node_modules$2f40$milkdown$2f$utils$2f$lib$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["$command"])("ExitTable", (ctx)=>()=>(state, dispatch)=>{
            if (!(0, __TURBOPACK__imported__module__$5b$project$5d2f$RiderProjects$2f$SyriaHub$2f$node_modules$2f$prosemirror$2d$tables$2f$dist$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["isInTable"])(state)) return false;
            const { $head } = state.selection;
            const table = (0, __TURBOPACK__imported__module__$5b$project$5d2f$RiderProjects$2f$SyriaHub$2f$node_modules$2f40$milkdown$2f$prose$2f$lib$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["findParentNodeType"])($head, tableSchema.type(ctx));
            if (!table) return false;
            const { to } = table;
            const tr = state.tr.replaceWith(to, to, __TURBOPACK__imported__module__$5b$project$5d2f$RiderProjects$2f$SyriaHub$2f$node_modules$2f40$milkdown$2f$preset$2d$commonmark$2f$lib$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["paragraphSchema"].type(ctx).createAndFill());
            tr.setSelection(__TURBOPACK__imported__module__$5b$project$5d2f$RiderProjects$2f$SyriaHub$2f$node_modules$2f$prosemirror$2d$state$2f$dist$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Selection"].near(tr.doc.resolve(to), 1)).scrollIntoView();
            dispatch?.(tr);
            return true;
        });
withMeta(exitTable, {
    displayName: "Command<breakTableCommand>",
    group: "Table"
});
const insertTableCommand = (0, __TURBOPACK__imported__module__$5b$project$5d2f$RiderProjects$2f$SyriaHub$2f$node_modules$2f40$milkdown$2f$utils$2f$lib$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["$command"])("InsertTable", (ctx)=>({ row, col } = {})=>(state, dispatch)=>{
            const { selection, tr } = state;
            const { from } = selection;
            const table = createTable(ctx, row, col);
            const _tr = tr.replaceSelectionWith(table);
            const sel = __TURBOPACK__imported__module__$5b$project$5d2f$RiderProjects$2f$SyriaHub$2f$node_modules$2f$prosemirror$2d$state$2f$dist$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Selection"].findFrom(_tr.doc.resolve(from), 1, true);
            if (sel) _tr.setSelection(sel);
            dispatch?.(_tr);
            return true;
        });
withMeta(insertTableCommand, {
    displayName: "Command<insertTableCommand>",
    group: "Table"
});
const moveRowCommand = (0, __TURBOPACK__imported__module__$5b$project$5d2f$RiderProjects$2f$SyriaHub$2f$node_modules$2f40$milkdown$2f$utils$2f$lib$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["$command"])("MoveRow", ()=>({ from, to, pos } = {})=>(0, __TURBOPACK__imported__module__$5b$project$5d2f$RiderProjects$2f$SyriaHub$2f$node_modules$2f$prosemirror$2d$tables$2f$dist$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["moveTableRow"])({
            from: from ?? 0,
            to: to ?? 0,
            pos
        }));
withMeta(moveRowCommand, {
    displayName: "Command<moveRowCommand>",
    group: "Table"
});
const moveColCommand = (0, __TURBOPACK__imported__module__$5b$project$5d2f$RiderProjects$2f$SyriaHub$2f$node_modules$2f40$milkdown$2f$utils$2f$lib$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["$command"])("MoveCol", ()=>({ from, to, pos } = {})=>(0, __TURBOPACK__imported__module__$5b$project$5d2f$RiderProjects$2f$SyriaHub$2f$node_modules$2f$prosemirror$2d$tables$2f$dist$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["moveTableColumn"])({
            from: from ?? 0,
            to: to ?? 0,
            pos
        }));
withMeta(moveColCommand, {
    displayName: "Command<moveColCommand>",
    group: "Table"
});
const selectRowCommand = (0, __TURBOPACK__imported__module__$5b$project$5d2f$RiderProjects$2f$SyriaHub$2f$node_modules$2f40$milkdown$2f$utils$2f$lib$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["$command"])("SelectRow", ()=>(payload = {
        index: 0
    })=>(state, dispatch)=>{
            const { tr } = state;
            const result = dispatch?.(selectRow(payload.index, payload.pos)(tr));
            return Boolean(result);
        });
withMeta(selectRowCommand, {
    displayName: "Command<selectRowCommand>",
    group: "Table"
});
const selectColCommand = (0, __TURBOPACK__imported__module__$5b$project$5d2f$RiderProjects$2f$SyriaHub$2f$node_modules$2f40$milkdown$2f$utils$2f$lib$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["$command"])("SelectCol", ()=>(payload = {
        index: 0
    })=>(state, dispatch)=>{
            const { tr } = state;
            const result = dispatch?.(selectCol(payload.index, payload.pos)(tr));
            return Boolean(result);
        });
withMeta(selectColCommand, {
    displayName: "Command<selectColCommand>",
    group: "Table"
});
const selectTableCommand = (0, __TURBOPACK__imported__module__$5b$project$5d2f$RiderProjects$2f$SyriaHub$2f$node_modules$2f40$milkdown$2f$utils$2f$lib$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["$command"])("SelectTable", ()=>()=>(state, dispatch)=>{
            const { tr } = state;
            const result = dispatch?.(selectTable(tr));
            return Boolean(result);
        });
withMeta(selectTableCommand, {
    displayName: "Command<selectTableCommand>",
    group: "Table"
});
const deleteSelectedCellsCommand = (0, __TURBOPACK__imported__module__$5b$project$5d2f$RiderProjects$2f$SyriaHub$2f$node_modules$2f40$milkdown$2f$utils$2f$lib$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["$command"])("DeleteSelectedCells", ()=>()=>(state, dispatch)=>{
            const { selection } = state;
            if (!(selection instanceof __TURBOPACK__imported__module__$5b$project$5d2f$RiderProjects$2f$SyriaHub$2f$node_modules$2f$prosemirror$2d$tables$2f$dist$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["CellSelection"])) return false;
            const isRow = selection.isRowSelection();
            const isCol = selection.isColSelection();
            if (isRow && isCol) return (0, __TURBOPACK__imported__module__$5b$project$5d2f$RiderProjects$2f$SyriaHub$2f$node_modules$2f$prosemirror$2d$tables$2f$dist$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["deleteTable"])(state, dispatch);
            if (isCol) return (0, __TURBOPACK__imported__module__$5b$project$5d2f$RiderProjects$2f$SyriaHub$2f$node_modules$2f$prosemirror$2d$tables$2f$dist$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["deleteColumn"])(state, dispatch);
            else return (0, __TURBOPACK__imported__module__$5b$project$5d2f$RiderProjects$2f$SyriaHub$2f$node_modules$2f$prosemirror$2d$tables$2f$dist$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["deleteRow"])(state, dispatch);
        });
withMeta(deleteSelectedCellsCommand, {
    displayName: "Command<deleteSelectedCellsCommand>",
    group: "Table"
});
const addColBeforeCommand = (0, __TURBOPACK__imported__module__$5b$project$5d2f$RiderProjects$2f$SyriaHub$2f$node_modules$2f40$milkdown$2f$utils$2f$lib$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["$command"])("AddColBefore", ()=>()=>__TURBOPACK__imported__module__$5b$project$5d2f$RiderProjects$2f$SyriaHub$2f$node_modules$2f$prosemirror$2d$tables$2f$dist$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["addColumnBefore"]);
withMeta(addColBeforeCommand, {
    displayName: "Command<addColBeforeCommand>",
    group: "Table"
});
const addColAfterCommand = (0, __TURBOPACK__imported__module__$5b$project$5d2f$RiderProjects$2f$SyriaHub$2f$node_modules$2f40$milkdown$2f$utils$2f$lib$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["$command"])("AddColAfter", ()=>()=>__TURBOPACK__imported__module__$5b$project$5d2f$RiderProjects$2f$SyriaHub$2f$node_modules$2f$prosemirror$2d$tables$2f$dist$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["addColumnAfter"]);
withMeta(addColAfterCommand, {
    displayName: "Command<addColAfterCommand>",
    group: "Table"
});
const addRowBeforeCommand = (0, __TURBOPACK__imported__module__$5b$project$5d2f$RiderProjects$2f$SyriaHub$2f$node_modules$2f40$milkdown$2f$utils$2f$lib$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["$command"])("AddRowBefore", (ctx)=>()=>(state, dispatch)=>{
            if (!(0, __TURBOPACK__imported__module__$5b$project$5d2f$RiderProjects$2f$SyriaHub$2f$node_modules$2f$prosemirror$2d$tables$2f$dist$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["isInTable"])(state)) return false;
            if (dispatch) {
                const rect = (0, __TURBOPACK__imported__module__$5b$project$5d2f$RiderProjects$2f$SyriaHub$2f$node_modules$2f$prosemirror$2d$tables$2f$dist$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["selectedRect"])(state);
                dispatch(addRowWithAlignment(ctx, state.tr, rect, rect.top));
            }
            return true;
        });
withMeta(addRowBeforeCommand, {
    displayName: "Command<addRowBeforeCommand>",
    group: "Table"
});
const addRowAfterCommand = (0, __TURBOPACK__imported__module__$5b$project$5d2f$RiderProjects$2f$SyriaHub$2f$node_modules$2f40$milkdown$2f$utils$2f$lib$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["$command"])("AddRowAfter", (ctx)=>()=>(state, dispatch)=>{
            if (!(0, __TURBOPACK__imported__module__$5b$project$5d2f$RiderProjects$2f$SyriaHub$2f$node_modules$2f$prosemirror$2d$tables$2f$dist$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["isInTable"])(state)) return false;
            if (dispatch) {
                const rect = (0, __TURBOPACK__imported__module__$5b$project$5d2f$RiderProjects$2f$SyriaHub$2f$node_modules$2f$prosemirror$2d$tables$2f$dist$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["selectedRect"])(state);
                dispatch(addRowWithAlignment(ctx, state.tr, rect, rect.bottom));
            }
            return true;
        });
withMeta(addRowAfterCommand, {
    displayName: "Command<addRowAfterCommand>",
    group: "Table"
});
const setAlignCommand = (0, __TURBOPACK__imported__module__$5b$project$5d2f$RiderProjects$2f$SyriaHub$2f$node_modules$2f40$milkdown$2f$utils$2f$lib$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["$command"])("SetAlign", ()=>(alignment = "left")=>(0, __TURBOPACK__imported__module__$5b$project$5d2f$RiderProjects$2f$SyriaHub$2f$node_modules$2f$prosemirror$2d$tables$2f$dist$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["setCellAttr"])("alignment", alignment));
withMeta(setAlignCommand, {
    displayName: "Command<setAlignCommand>",
    group: "Table"
});
const insertTableInputRule = (0, __TURBOPACK__imported__module__$5b$project$5d2f$RiderProjects$2f$SyriaHub$2f$node_modules$2f40$milkdown$2f$utils$2f$lib$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["$inputRule"])((ctx)=>new __TURBOPACK__imported__module__$5b$project$5d2f$RiderProjects$2f$SyriaHub$2f$node_modules$2f$prosemirror$2d$inputrules$2f$dist$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["InputRule"](/^\|(?<col>\d+)[xX](?<row>\d+)\|\s$/, (state, match, start, end)=>{
        const $start = state.doc.resolve(start);
        if (!$start.node(-1).canReplaceWith($start.index(-1), $start.indexAfter(-1), tableSchema.type(ctx))) return null;
        const row = Math.max(Number(match.groups?.row ?? 0), 2);
        const tableNode = createTable(ctx, row, Number(match.groups?.col));
        const tr = state.tr.replaceRangeWith(start, end, tableNode);
        return tr.setSelection(__TURBOPACK__imported__module__$5b$project$5d2f$RiderProjects$2f$SyriaHub$2f$node_modules$2f$prosemirror$2d$state$2f$dist$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["TextSelection"].create(tr.doc, start + 3)).scrollIntoView();
    }));
withMeta(insertTableInputRule, {
    displayName: "InputRule<insertTableInputRule>",
    group: "Table"
});
const tablePasteRule = (0, __TURBOPACK__imported__module__$5b$project$5d2f$RiderProjects$2f$SyriaHub$2f$node_modules$2f40$milkdown$2f$utils$2f$lib$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["$pasteRule"])((ctx)=>({
        run: (slice, _view, isPlainText)=>{
            if (isPlainText) {
                return slice;
            }
            let fragment = slice.content;
            slice.content.forEach((node, _offset, index)=>{
                if (node?.type !== tableSchema.type(ctx)) {
                    return;
                }
                const rowsCount = node.childCount;
                const colsCount = node.lastChild?.childCount ?? 0;
                if (rowsCount === 0 || colsCount === 0) {
                    fragment = fragment.replaceChild(index, __TURBOPACK__imported__module__$5b$project$5d2f$RiderProjects$2f$SyriaHub$2f$node_modules$2f40$milkdown$2f$preset$2d$commonmark$2f$lib$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["paragraphSchema"].type(ctx).create());
                    return;
                }
                const headerRow = node.firstChild;
                const needToFixHeaderRow = colsCount > 0 && headerRow && headerRow.childCount === 0;
                if (!needToFixHeaderRow) {
                    return;
                }
                const headerCells = Array(colsCount).fill(0).map(()=>tableHeaderSchema.type(ctx).createAndFill());
                const tableCells = new __TURBOPACK__imported__module__$5b$project$5d2f$RiderProjects$2f$SyriaHub$2f$node_modules$2f$prosemirror$2d$model$2f$dist$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Slice"](__TURBOPACK__imported__module__$5b$project$5d2f$RiderProjects$2f$SyriaHub$2f$node_modules$2f$prosemirror$2d$model$2f$dist$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Fragment"].from(headerCells), 0, 0);
                const newHeaderRow = headerRow.replace(0, 0, tableCells);
                const newTable = node.replace(0, headerRow.nodeSize, new __TURBOPACK__imported__module__$5b$project$5d2f$RiderProjects$2f$SyriaHub$2f$node_modules$2f$prosemirror$2d$model$2f$dist$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Slice"](__TURBOPACK__imported__module__$5b$project$5d2f$RiderProjects$2f$SyriaHub$2f$node_modules$2f$prosemirror$2d$model$2f$dist$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Fragment"].from(newHeaderRow), 0, 0));
                fragment = fragment.replaceChild(index, newTable);
            });
            return new __TURBOPACK__imported__module__$5b$project$5d2f$RiderProjects$2f$SyriaHub$2f$node_modules$2f$prosemirror$2d$model$2f$dist$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Slice"](__TURBOPACK__imported__module__$5b$project$5d2f$RiderProjects$2f$SyriaHub$2f$node_modules$2f$prosemirror$2d$model$2f$dist$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Fragment"].from(fragment), slice.openStart, slice.openEnd);
        }
    }));
withMeta(tablePasteRule, {
    displayName: "PasteRule<table>",
    group: "Table"
});
const tableKeymap = (0, __TURBOPACK__imported__module__$5b$project$5d2f$RiderProjects$2f$SyriaHub$2f$node_modules$2f40$milkdown$2f$utils$2f$lib$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["$useKeymap"])("tableKeymap", {
    NextCell: {
        priority: 100,
        shortcuts: [
            "Mod-]",
            "Tab"
        ],
        command: (ctx)=>{
            const commands2 = ctx.get(__TURBOPACK__imported__module__$5b$project$5d2f$RiderProjects$2f$SyriaHub$2f$node_modules$2f40$milkdown$2f$core$2f$lib$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["commandsCtx"]);
            return ()=>commands2.call(goToNextTableCellCommand.key);
        }
    },
    PrevCell: {
        shortcuts: [
            "Mod-[",
            "Shift-Tab"
        ],
        command: (ctx)=>{
            const commands2 = ctx.get(__TURBOPACK__imported__module__$5b$project$5d2f$RiderProjects$2f$SyriaHub$2f$node_modules$2f40$milkdown$2f$core$2f$lib$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["commandsCtx"]);
            return ()=>commands2.call(goToPrevTableCellCommand.key);
        }
    },
    ExitTable: {
        shortcuts: [
            "Mod-Enter",
            "Enter"
        ],
        command: (ctx)=>{
            const commands2 = ctx.get(__TURBOPACK__imported__module__$5b$project$5d2f$RiderProjects$2f$SyriaHub$2f$node_modules$2f40$milkdown$2f$core$2f$lib$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["commandsCtx"]);
            return ()=>commands2.call(exitTable.key);
        }
    }
});
withMeta(tableKeymap.ctx, {
    displayName: "KeymapCtx<table>",
    group: "Table"
});
withMeta(tableKeymap.shortcuts, {
    displayName: "Keymap<table>",
    group: "Table"
});
const id$1 = "footnote_definition";
const markdownId = "footnoteDefinition";
const footnoteDefinitionSchema = (0, __TURBOPACK__imported__module__$5b$project$5d2f$RiderProjects$2f$SyriaHub$2f$node_modules$2f40$milkdown$2f$utils$2f$lib$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["$nodeSchema"])("footnote_definition", ()=>({
        group: "block",
        content: "block+",
        defining: true,
        attrs: {
            label: {
                default: "",
                validate: "string"
            }
        },
        parseDOM: [
            {
                tag: `dl[data-type="${id$1}"]`,
                getAttrs: (dom)=>{
                    if (!(dom instanceof HTMLElement)) throw (0, __TURBOPACK__imported__module__$5b$project$5d2f$RiderProjects$2f$SyriaHub$2f$node_modules$2f40$milkdown$2f$exception$2f$lib$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["expectDomTypeError"])(dom);
                    return {
                        label: dom.dataset.label
                    };
                },
                contentElement: "dd"
            }
        ],
        toDOM: (node)=>{
            const label = node.attrs.label;
            return [
                "dl",
                {
                    // TODO: add a prosemirror plugin to sync label on change
                    "data-label": label,
                    "data-type": id$1
                },
                [
                    "dt",
                    label
                ],
                [
                    "dd",
                    0
                ]
            ];
        },
        parseMarkdown: {
            match: ({ type })=>type === markdownId,
            runner: (state, node, type)=>{
                state.openNode(type, {
                    label: node.label
                }).next(node.children).closeNode();
            }
        },
        toMarkdown: {
            match: (node)=>node.type.name === id$1,
            runner: (state, node)=>{
                state.openNode(markdownId, void 0, {
                    label: node.attrs.label,
                    identifier: node.attrs.label
                }).next(node.content).closeNode();
            }
        }
    }));
withMeta(footnoteDefinitionSchema.ctx, {
    displayName: "NodeSchemaCtx<footnodeDef>",
    group: "footnote"
});
withMeta(footnoteDefinitionSchema.node, {
    displayName: "NodeSchema<footnodeDef>",
    group: "footnote"
});
const id = "footnote_reference";
const footnoteReferenceSchema = (0, __TURBOPACK__imported__module__$5b$project$5d2f$RiderProjects$2f$SyriaHub$2f$node_modules$2f40$milkdown$2f$utils$2f$lib$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["$nodeSchema"])("footnote_reference", ()=>({
        group: "inline",
        inline: true,
        atom: true,
        attrs: {
            label: {
                default: "",
                validate: "string"
            }
        },
        parseDOM: [
            {
                tag: `sup[data-type="${id}"]`,
                getAttrs: (dom)=>{
                    if (!(dom instanceof HTMLElement)) throw (0, __TURBOPACK__imported__module__$5b$project$5d2f$RiderProjects$2f$SyriaHub$2f$node_modules$2f40$milkdown$2f$exception$2f$lib$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["expectDomTypeError"])(dom);
                    return {
                        label: dom.dataset.label
                    };
                }
            }
        ],
        toDOM: (node)=>{
            const label = node.attrs.label;
            return [
                "sup",
                {
                    // TODO: add a prosemirror plugin to sync label on change
                    "data-label": label,
                    "data-type": id
                },
                label
            ];
        },
        parseMarkdown: {
            match: ({ type })=>type === "footnoteReference",
            runner: (state, node, type)=>{
                state.addNode(type, {
                    label: node.label
                });
            }
        },
        toMarkdown: {
            match: (node)=>node.type.name === id,
            runner: (state, node)=>{
                state.addNode("footnoteReference", void 0, void 0, {
                    label: node.attrs.label,
                    identifier: node.attrs.label
                });
            }
        }
    }));
withMeta(footnoteReferenceSchema.ctx, {
    displayName: "NodeSchemaCtx<footnodeRef>",
    group: "footnote"
});
withMeta(footnoteReferenceSchema.node, {
    displayName: "NodeSchema<footnodeRef>",
    group: "footnote"
});
const extendListItemSchemaForTask = __TURBOPACK__imported__module__$5b$project$5d2f$RiderProjects$2f$SyriaHub$2f$node_modules$2f40$milkdown$2f$preset$2d$commonmark$2f$lib$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["listItemSchema"].extendSchema((prev)=>{
    return (ctx)=>{
        const baseSchema = prev(ctx);
        return {
            ...baseSchema,
            attrs: {
                ...baseSchema.attrs,
                checked: {
                    default: null,
                    validate: "boolean|null"
                }
            },
            parseDOM: [
                {
                    tag: 'li[data-item-type="task"]',
                    getAttrs: (dom)=>{
                        if (!(dom instanceof HTMLElement)) throw (0, __TURBOPACK__imported__module__$5b$project$5d2f$RiderProjects$2f$SyriaHub$2f$node_modules$2f40$milkdown$2f$exception$2f$lib$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["expectDomTypeError"])(dom);
                        return {
                            label: dom.dataset.label,
                            listType: dom.dataset.listType,
                            spread: dom.dataset.spread,
                            checked: dom.dataset.checked ? dom.dataset.checked === "true" : null
                        };
                    }
                },
                ...baseSchema?.parseDOM || []
            ],
            toDOM: (node)=>{
                if (baseSchema.toDOM && node.attrs.checked == null) return baseSchema.toDOM(node);
                return [
                    "li",
                    {
                        "data-item-type": "task",
                        "data-label": node.attrs.label,
                        "data-list-type": node.attrs.listType,
                        "data-spread": node.attrs.spread,
                        "data-checked": node.attrs.checked
                    },
                    0
                ];
            },
            parseMarkdown: {
                match: ({ type })=>type === "listItem",
                runner: (state, node, type)=>{
                    if (node.checked == null) {
                        baseSchema.parseMarkdown.runner(state, node, type);
                        return;
                    }
                    const label = node.label != null ? `${node.label}.` : "•";
                    const checked = node.checked != null ? Boolean(node.checked) : null;
                    const listType = node.label != null ? "ordered" : "bullet";
                    const spread = node.spread != null ? `${node.spread}` : "true";
                    state.openNode(type, {
                        label,
                        listType,
                        spread,
                        checked
                    });
                    state.next(node.children);
                    state.closeNode();
                }
            },
            toMarkdown: {
                match: (node)=>node.type.name === "list_item",
                runner: (state, node)=>{
                    if (node.attrs.checked == null) {
                        baseSchema.toMarkdown.runner(state, node);
                        return;
                    }
                    const label = node.attrs.label;
                    const listType = node.attrs.listType;
                    const spread = node.attrs.spread === "true";
                    const checked = node.attrs.checked;
                    state.openNode("listItem", void 0, {
                        label,
                        listType,
                        spread,
                        checked
                    });
                    state.next(node.content);
                    state.closeNode();
                }
            }
        };
    };
});
withMeta(extendListItemSchemaForTask.node, {
    displayName: "NodeSchema<taskListItem>",
    group: "ListItem"
});
withMeta(extendListItemSchemaForTask.ctx, {
    displayName: "NodeSchemaCtx<taskListItem>",
    group: "ListItem"
});
const wrapInTaskListInputRule = (0, __TURBOPACK__imported__module__$5b$project$5d2f$RiderProjects$2f$SyriaHub$2f$node_modules$2f40$milkdown$2f$utils$2f$lib$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["$inputRule"])(()=>{
    return new __TURBOPACK__imported__module__$5b$project$5d2f$RiderProjects$2f$SyriaHub$2f$node_modules$2f$prosemirror$2d$inputrules$2f$dist$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["InputRule"](/^\[(?<checked>\s|x)\]\s$/, (state, match, start, end)=>{
        const pos = state.doc.resolve(start);
        let depth = 0;
        let node = pos.node(depth);
        while(node && node.type.name !== "list_item"){
            depth--;
            node = pos.node(depth);
        }
        if (!node || node.attrs.checked != null) return null;
        const checked = Boolean(match.groups?.checked === "x");
        const finPos = pos.before(depth);
        const tr = state.tr;
        tr.deleteRange(start, end).setNodeMarkup(finPos, void 0, {
            ...node.attrs,
            checked
        });
        return tr;
    });
});
withMeta(wrapInTaskListInputRule, {
    displayName: "InputRule<wrapInTaskListInputRule>",
    group: "ListItem"
});
const keymap = [
    strikethroughKeymap,
    tableKeymap
].flat();
const inputRules = [
    insertTableInputRule,
    wrapInTaskListInputRule
];
const markInputRules = [
    strikethroughInputRule
];
const pasteRules = [
    tablePasteRule
];
const autoInsertSpanPlugin = (0, __TURBOPACK__imported__module__$5b$project$5d2f$RiderProjects$2f$SyriaHub$2f$node_modules$2f40$milkdown$2f$utils$2f$lib$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["$prose"])(()=>__TURBOPACK__imported__module__$5b$project$5d2f$RiderProjects$2f$SyriaHub$2f$node_modules$2f$prosemirror$2d$safari$2d$ime$2d$span$2f$dist$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["imeSpan"]);
withMeta(autoInsertSpanPlugin, {
    displayName: "Prose<autoInsertSpanPlugin>",
    group: "Prose"
});
const columnResizingPlugin = (0, __TURBOPACK__imported__module__$5b$project$5d2f$RiderProjects$2f$SyriaHub$2f$node_modules$2f40$milkdown$2f$utils$2f$lib$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["$prose"])(()=>(0, __TURBOPACK__imported__module__$5b$project$5d2f$RiderProjects$2f$SyriaHub$2f$node_modules$2f$prosemirror$2d$tables$2f$dist$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["columnResizing"])({}));
withMeta(columnResizingPlugin, {
    displayName: "Prose<columnResizingPlugin>",
    group: "Prose"
});
const tableEditingPlugin = (0, __TURBOPACK__imported__module__$5b$project$5d2f$RiderProjects$2f$SyriaHub$2f$node_modules$2f40$milkdown$2f$utils$2f$lib$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["$prose"])(()=>(0, __TURBOPACK__imported__module__$5b$project$5d2f$RiderProjects$2f$SyriaHub$2f$node_modules$2f$prosemirror$2d$tables$2f$dist$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["tableEditing"])({
        allowTableNodeSelection: true
    }));
withMeta(tableEditingPlugin, {
    displayName: "Prose<tableEditingPlugin>",
    group: "Prose"
});
const remarkGFMPlugin = (0, __TURBOPACK__imported__module__$5b$project$5d2f$RiderProjects$2f$SyriaHub$2f$node_modules$2f40$milkdown$2f$utils$2f$lib$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["$remark"])("remarkGFM", ()=>__TURBOPACK__imported__module__$5b$project$5d2f$RiderProjects$2f$SyriaHub$2f$node_modules$2f$remark$2d$gfm$2f$lib$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"]);
withMeta(remarkGFMPlugin.plugin, {
    displayName: "Remark<remarkGFMPlugin>",
    group: "Remark"
});
withMeta(remarkGFMPlugin.options, {
    displayName: "RemarkConfig<remarkGFMPlugin>",
    group: "Remark"
});
const pluginKey = new __TURBOPACK__imported__module__$5b$project$5d2f$RiderProjects$2f$SyriaHub$2f$node_modules$2f$prosemirror$2d$state$2f$dist$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["PluginKey"]("MILKDOWN_KEEP_TABLE_ALIGN_PLUGIN");
function getChildIndex(node, parent) {
    let index = 0;
    parent.forEach((child, _offset, i)=>{
        if (child === node) index = i;
    });
    return index;
}
const keepTableAlignPlugin = (0, __TURBOPACK__imported__module__$5b$project$5d2f$RiderProjects$2f$SyriaHub$2f$node_modules$2f40$milkdown$2f$utils$2f$lib$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["$prose"])(()=>{
    return new __TURBOPACK__imported__module__$5b$project$5d2f$RiderProjects$2f$SyriaHub$2f$node_modules$2f$prosemirror$2d$state$2f$dist$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Plugin"]({
        key: pluginKey,
        appendTransaction: (_tr, oldState, state)=>{
            let tr;
            const check = (node, pos)=>{
                if (!tr) tr = state.tr;
                if (node.type.name !== "table_cell") return;
                const $pos = state.doc.resolve(pos);
                const tableRow = $pos.node($pos.depth);
                const table = $pos.node($pos.depth - 1);
                const tableHeaderRow = table.firstChild;
                if (!tableHeaderRow) return;
                const index = getChildIndex(node, tableRow);
                const headerCell = tableHeaderRow.maybeChild(index);
                if (!headerCell) return;
                const align = headerCell.attrs.alignment;
                const currentAlign = node.attrs.alignment;
                if (align === currentAlign) return;
                tr.setNodeMarkup(pos, void 0, {
                    ...node.attrs,
                    alignment: align
                });
            };
            if (oldState.doc !== state.doc) state.doc.descendants(check);
            return tr;
        }
    });
});
withMeta(keepTableAlignPlugin, {
    displayName: "Prose<keepTableAlignPlugin>",
    group: "Prose"
});
const plugins = [
    keepTableAlignPlugin,
    autoInsertSpanPlugin,
    remarkGFMPlugin,
    tableEditingPlugin
].flat();
const schema = [
    extendListItemSchemaForTask,
    tableSchema,
    tableHeaderRowSchema,
    tableRowSchema,
    tableHeaderSchema,
    tableCellSchema,
    footnoteDefinitionSchema,
    footnoteReferenceSchema,
    strikethroughAttr,
    strikethroughSchema
].flat();
const commands = [
    goToNextTableCellCommand,
    goToPrevTableCellCommand,
    exitTable,
    insertTableCommand,
    moveRowCommand,
    moveColCommand,
    selectRowCommand,
    selectColCommand,
    selectTableCommand,
    deleteSelectedCellsCommand,
    addRowBeforeCommand,
    addRowAfterCommand,
    addColBeforeCommand,
    addColAfterCommand,
    setAlignCommand,
    toggleStrikethroughCommand
];
const gfm = [
    schema,
    inputRules,
    pasteRules,
    markInputRules,
    keymap,
    commands,
    plugins
].flat();
;
 //# sourceMappingURL=index.js.map
}),
"[project]/RiderProjects/SyriaHub/node_modules/@milkdown/plugin-history/lib/index.js [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "history",
    ()=>history,
    "historyKeymap",
    ()=>historyKeymap,
    "historyProviderConfig",
    ()=>historyProviderConfig,
    "historyProviderPlugin",
    ()=>historyProviderPlugin,
    "redoCommand",
    ()=>redoCommand,
    "undoCommand",
    ()=>undoCommand
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$RiderProjects$2f$SyriaHub$2f$node_modules$2f40$milkdown$2f$core$2f$lib$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/RiderProjects/SyriaHub/node_modules/@milkdown/core/lib/index.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$RiderProjects$2f$SyriaHub$2f$node_modules$2f$prosemirror$2d$history$2f$dist$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/RiderProjects/SyriaHub/node_modules/prosemirror-history/dist/index.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$RiderProjects$2f$SyriaHub$2f$node_modules$2f40$milkdown$2f$utils$2f$lib$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/RiderProjects/SyriaHub/node_modules/@milkdown/utils/lib/index.js [app-client] (ecmascript)");
;
;
;
function withMeta(plugin, meta) {
    Object.assign(plugin, {
        meta: {
            package: "@milkdown/plugin-history",
            ...meta
        }
    });
    return plugin;
}
const undoCommand = (0, __TURBOPACK__imported__module__$5b$project$5d2f$RiderProjects$2f$SyriaHub$2f$node_modules$2f40$milkdown$2f$utils$2f$lib$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["$command"])("Undo", ()=>()=>__TURBOPACK__imported__module__$5b$project$5d2f$RiderProjects$2f$SyriaHub$2f$node_modules$2f$prosemirror$2d$history$2f$dist$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["undo"]);
withMeta(undoCommand, {
    displayName: "Command<undo>"
});
const redoCommand = (0, __TURBOPACK__imported__module__$5b$project$5d2f$RiderProjects$2f$SyriaHub$2f$node_modules$2f40$milkdown$2f$utils$2f$lib$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["$command"])("Redo", ()=>()=>__TURBOPACK__imported__module__$5b$project$5d2f$RiderProjects$2f$SyriaHub$2f$node_modules$2f$prosemirror$2d$history$2f$dist$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["redo"]);
withMeta(redoCommand, {
    displayName: "Command<redo>"
});
const historyProviderConfig = (0, __TURBOPACK__imported__module__$5b$project$5d2f$RiderProjects$2f$SyriaHub$2f$node_modules$2f40$milkdown$2f$utils$2f$lib$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["$ctx"])({}, "historyProviderConfig");
withMeta(historyProviderConfig, {
    displayName: "Ctx<historyProviderConfig>"
});
const historyProviderPlugin = (0, __TURBOPACK__imported__module__$5b$project$5d2f$RiderProjects$2f$SyriaHub$2f$node_modules$2f40$milkdown$2f$utils$2f$lib$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["$prose"])((ctx)=>(0, __TURBOPACK__imported__module__$5b$project$5d2f$RiderProjects$2f$SyriaHub$2f$node_modules$2f$prosemirror$2d$history$2f$dist$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["history"])(ctx.get(historyProviderConfig.key)));
withMeta(historyProviderPlugin, {
    displayName: "Ctx<historyProviderPlugin>"
});
const historyKeymap = (0, __TURBOPACK__imported__module__$5b$project$5d2f$RiderProjects$2f$SyriaHub$2f$node_modules$2f40$milkdown$2f$utils$2f$lib$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["$useKeymap"])("historyKeymap", {
    Undo: {
        shortcuts: "Mod-z",
        command: (ctx)=>{
            const commands = ctx.get(__TURBOPACK__imported__module__$5b$project$5d2f$RiderProjects$2f$SyriaHub$2f$node_modules$2f40$milkdown$2f$core$2f$lib$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["commandsCtx"]);
            return ()=>commands.call(undoCommand.key);
        }
    },
    Redo: {
        shortcuts: [
            "Mod-y",
            "Shift-Mod-z"
        ],
        command: (ctx)=>{
            const commands = ctx.get(__TURBOPACK__imported__module__$5b$project$5d2f$RiderProjects$2f$SyriaHub$2f$node_modules$2f40$milkdown$2f$core$2f$lib$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["commandsCtx"]);
            return ()=>commands.call(redoCommand.key);
        }
    }
});
withMeta(historyKeymap.ctx, {
    displayName: "KeymapCtx<history>"
});
withMeta(historyKeymap.shortcuts, {
    displayName: "Keymap<history>"
});
const history = [
    historyProviderConfig,
    historyProviderPlugin,
    historyKeymap,
    undoCommand,
    redoCommand
].flat();
;
 //# sourceMappingURL=index.js.map
}),
"[project]/RiderProjects/SyriaHub/node_modules/@milkdown/plugin-listener/lib/index.js [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "ListenerManager",
    ()=>ListenerManager,
    "key",
    ()=>key,
    "listener",
    ()=>listener,
    "listenerCtx",
    ()=>listenerCtx
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$RiderProjects$2f$SyriaHub$2f$node_modules$2f40$milkdown$2f$core$2f$lib$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/RiderProjects/SyriaHub/node_modules/@milkdown/core/lib/index.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$RiderProjects$2f$SyriaHub$2f$node_modules$2f40$milkdown$2f$ctx$2f$lib$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/RiderProjects/SyriaHub/node_modules/@milkdown/ctx/lib/index.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$RiderProjects$2f$SyriaHub$2f$node_modules$2f$prosemirror$2d$state$2f$dist$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/RiderProjects/SyriaHub/node_modules/prosemirror-state/dist/index.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$RiderProjects$2f$SyriaHub$2f$node_modules$2f$lodash$2d$es$2f$debounce$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__debounce$3e$__ = __turbopack_context__.i("[project]/RiderProjects/SyriaHub/node_modules/lodash-es/debounce.js [app-client] (ecmascript) <export default as debounce>");
;
;
;
;
class ListenerManager {
    constructor(){
        this.beforeMountedListeners = [];
        this.mountedListeners = [];
        this.updatedListeners = [];
        this.selectionUpdatedListeners = [];
        this.markdownUpdatedListeners = [];
        this.blurListeners = [];
        this.focusListeners = [];
        this.destroyListeners = [];
        this.beforeMount = (fn)=>{
            this.beforeMountedListeners.push(fn);
            return this;
        };
        this.mounted = (fn)=>{
            this.mountedListeners.push(fn);
            return this;
        };
        this.updated = (fn)=>{
            this.updatedListeners.push(fn);
            return this;
        };
    }
    /// A getter to get all [subscribers](#interface-subscribers). You should not use this method directly.
    get listeners() {
        return {
            beforeMount: this.beforeMountedListeners,
            mounted: this.mountedListeners,
            updated: this.updatedListeners,
            markdownUpdated: this.markdownUpdatedListeners,
            blur: this.blurListeners,
            focus: this.focusListeners,
            destroy: this.destroyListeners,
            selectionUpdated: this.selectionUpdatedListeners
        };
    }
    /// Subscribe to the markdownUpdated event.
    /// This event will be triggered after the editor state is updated and **the document is changed**.
    /// The second parameter is the current markdown and the third parameter is the previous markdown.
    markdownUpdated(fn) {
        this.markdownUpdatedListeners.push(fn);
        return this;
    }
    /// Subscribe to the blur event.
    /// This event will be triggered when the editor is blurred.
    blur(fn) {
        this.blurListeners.push(fn);
        return this;
    }
    /// Subscribe to the focus event.
    /// This event will be triggered when the editor is focused.
    focus(fn) {
        this.focusListeners.push(fn);
        return this;
    }
    /// Subscribe to the destroy event.
    /// This event will be triggered before the editor is destroyed.
    destroy(fn) {
        this.destroyListeners.push(fn);
        return this;
    }
    /// Subscribe to the selectionUpdated event.
    /// This event will be triggered when the editor selection is updated.
    selectionUpdated(fn) {
        this.selectionUpdatedListeners.push(fn);
        return this;
    }
}
const listenerCtx = (0, __TURBOPACK__imported__module__$5b$project$5d2f$RiderProjects$2f$SyriaHub$2f$node_modules$2f40$milkdown$2f$ctx$2f$lib$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["createSlice"])(new ListenerManager(), "listener");
const key = new __TURBOPACK__imported__module__$5b$project$5d2f$RiderProjects$2f$SyriaHub$2f$node_modules$2f$prosemirror$2d$state$2f$dist$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["PluginKey"]("MILKDOWN_LISTENER");
const listener = (ctx)=>{
    ctx.inject(listenerCtx, new ListenerManager());
    return async ()=>{
        await ctx.wait(__TURBOPACK__imported__module__$5b$project$5d2f$RiderProjects$2f$SyriaHub$2f$node_modules$2f40$milkdown$2f$core$2f$lib$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["InitReady"]);
        const listener2 = ctx.get(listenerCtx);
        const { listeners } = listener2;
        listeners.beforeMount.forEach((fn)=>fn(ctx));
        await ctx.wait(__TURBOPACK__imported__module__$5b$project$5d2f$RiderProjects$2f$SyriaHub$2f$node_modules$2f40$milkdown$2f$core$2f$lib$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["SerializerReady"]);
        const serializer = ctx.get(__TURBOPACK__imported__module__$5b$project$5d2f$RiderProjects$2f$SyriaHub$2f$node_modules$2f40$milkdown$2f$core$2f$lib$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["serializerCtx"]);
        let prevDoc = null;
        let prevMarkdown = null;
        let prevSelection = null;
        const plugin = new __TURBOPACK__imported__module__$5b$project$5d2f$RiderProjects$2f$SyriaHub$2f$node_modules$2f$prosemirror$2d$state$2f$dist$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Plugin"]({
            key,
            view: ()=>{
                return {
                    destroy: ()=>{
                        listeners.destroy.forEach((fn)=>fn(ctx));
                    }
                };
            },
            props: {
                handleDOMEvents: {
                    focus: ()=>{
                        listeners.focus.forEach((fn)=>fn(ctx));
                        return false;
                    },
                    blur: ()=>{
                        listeners.blur.forEach((fn)=>fn(ctx));
                        return false;
                    }
                }
            },
            state: {
                init: (_, instance)=>{
                    prevDoc = instance.doc;
                    prevMarkdown = serializer(instance.doc);
                },
                apply: (tr)=>{
                    const currentSelection = tr.selection;
                    if (!prevSelection && currentSelection || prevSelection && !currentSelection.eq(prevSelection)) {
                        listeners.selectionUpdated.forEach((fn)=>{
                            fn(ctx, currentSelection, prevSelection);
                        });
                        prevSelection = currentSelection;
                    }
                    if (!(tr.docChanged || tr.storedMarksSet) || tr.getMeta("addToHistory") === false) return;
                    const handler = (0, __TURBOPACK__imported__module__$5b$project$5d2f$RiderProjects$2f$SyriaHub$2f$node_modules$2f$lodash$2d$es$2f$debounce$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__debounce$3e$__["debounce"])(()=>{
                        const { doc } = tr;
                        if (listeners.updated.length > 0 && prevDoc && !prevDoc.eq(doc)) {
                            listeners.updated.forEach((fn)=>{
                                fn(ctx, doc, prevDoc);
                            });
                        }
                        if (listeners.markdownUpdated.length > 0 && prevDoc && !prevDoc.eq(doc)) {
                            const markdown = serializer(doc);
                            listeners.markdownUpdated.forEach((fn)=>{
                                fn(ctx, markdown, prevMarkdown);
                            });
                            prevMarkdown = markdown;
                        }
                        prevDoc = doc;
                    }, 200);
                    return handler();
                }
            }
        });
        ctx.update(__TURBOPACK__imported__module__$5b$project$5d2f$RiderProjects$2f$SyriaHub$2f$node_modules$2f40$milkdown$2f$core$2f$lib$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["prosePluginsCtx"], (x)=>x.concat(plugin));
        await ctx.wait(__TURBOPACK__imported__module__$5b$project$5d2f$RiderProjects$2f$SyriaHub$2f$node_modules$2f40$milkdown$2f$core$2f$lib$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["EditorViewReady"]);
        listeners.mounted.forEach((fn)=>fn(ctx));
    };
};
listener.meta = {
    package: "@milkdown/plugin-listener",
    displayName: "Listener"
};
;
 //# sourceMappingURL=index.js.map
}),
"[project]/RiderProjects/SyriaHub/node_modules/@milkdown/react/lib/index.js [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "Milkdown",
    ()=>Milkdown,
    "MilkdownProvider",
    ()=>MilkdownProvider,
    "useEditor",
    ()=>useEditor,
    "useInstance",
    ()=>useInstance
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$RiderProjects$2f$SyriaHub$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/RiderProjects/SyriaHub/node_modules/next/dist/compiled/react/index.js [app-client] (ecmascript)");
;
const editorInfoContext = (0, __TURBOPACK__imported__module__$5b$project$5d2f$RiderProjects$2f$SyriaHub$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["createContext"])({});
function useGetEditor() {
    const { dom, editor: editorRef, setLoading, editorFactory: getEditor } = (0, __TURBOPACK__imported__module__$5b$project$5d2f$RiderProjects$2f$SyriaHub$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useContext"])(editorInfoContext);
    const domRef = (0, __TURBOPACK__imported__module__$5b$project$5d2f$RiderProjects$2f$SyriaHub$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useRef"])(null);
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$RiderProjects$2f$SyriaHub$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useEffect"])({
        "useGetEditor.useEffect": ()=>{
            const div = domRef.current;
            if (!getEditor) return;
            if (!div) return;
            dom.current = div;
            const editor = getEditor(div);
            if (!editor) return;
            setLoading(true);
            editor.create().then({
                "useGetEditor.useEffect": (editor2)=>{
                    editorRef.current = editor2;
                }
            }["useGetEditor.useEffect"]).finally({
                "useGetEditor.useEffect": ()=>{
                    setLoading(false);
                }
            }["useGetEditor.useEffect"]).catch(console.error);
            return ({
                "useGetEditor.useEffect": ()=>{
                    editor.destroy().catch(console.error);
                }
            })["useGetEditor.useEffect"];
        }
    }["useGetEditor.useEffect"], [
        dom,
        editorRef,
        getEditor,
        setLoading
    ]);
    return domRef;
}
const Milkdown = ()=>{
    const domRef = useGetEditor();
    return /* @__PURE__ */ __TURBOPACK__imported__module__$5b$project$5d2f$RiderProjects$2f$SyriaHub$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"].createElement("div", {
        "data-milkdown-root": true,
        ref: domRef
    });
};
const MilkdownProvider = ({ children })=>{
    const dom = (0, __TURBOPACK__imported__module__$5b$project$5d2f$RiderProjects$2f$SyriaHub$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useRef"])(void 0);
    const [editorFactory, setEditorFactory] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$RiderProjects$2f$SyriaHub$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(void 0);
    const editor = (0, __TURBOPACK__imported__module__$5b$project$5d2f$RiderProjects$2f$SyriaHub$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useRef"])(void 0);
    const [loading, setLoading] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$RiderProjects$2f$SyriaHub$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(true);
    const editorInfoCtx = (0, __TURBOPACK__imported__module__$5b$project$5d2f$RiderProjects$2f$SyriaHub$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useMemo"])({
        "MilkdownProvider.useMemo[editorInfoCtx]": ()=>({
                loading,
                dom,
                editor,
                setLoading,
                editorFactory,
                setEditorFactory
            })
    }["MilkdownProvider.useMemo[editorInfoCtx]"], [
        loading,
        editorFactory
    ]);
    return /* @__PURE__ */ __TURBOPACK__imported__module__$5b$project$5d2f$RiderProjects$2f$SyriaHub$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"].createElement(editorInfoContext.Provider, {
        value: editorInfoCtx
    }, children);
};
function useEditor(getEditor, deps = []) {
    const editorInfo = (0, __TURBOPACK__imported__module__$5b$project$5d2f$RiderProjects$2f$SyriaHub$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useContext"])(editorInfoContext);
    const factory = (0, __TURBOPACK__imported__module__$5b$project$5d2f$RiderProjects$2f$SyriaHub$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useCallback"])(getEditor, deps);
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$RiderProjects$2f$SyriaHub$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useLayoutEffect"])({
        "useEditor.useLayoutEffect": ()=>{
            editorInfo.setEditorFactory({
                "useEditor.useLayoutEffect": ()=>factory
            }["useEditor.useLayoutEffect"]);
        }
    }["useEditor.useLayoutEffect"], [
        editorInfo,
        factory
    ]);
    return {
        loading: editorInfo.loading,
        get: ()=>editorInfo.editor.current
    };
}
function useInstance() {
    const editorInfo = (0, __TURBOPACK__imported__module__$5b$project$5d2f$RiderProjects$2f$SyriaHub$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useContext"])(editorInfoContext);
    const getInstance = (0, __TURBOPACK__imported__module__$5b$project$5d2f$RiderProjects$2f$SyriaHub$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useCallback"])({
        "useInstance.useCallback[getInstance]": ()=>{
            return editorInfo.editor.current;
        }
    }["useInstance.useCallback[getInstance]"], [
        editorInfo.editor
    ]);
    return [
        editorInfo.loading,
        getInstance
    ];
}
;
 //# sourceMappingURL=index.js.map
}),
]);

//# sourceMappingURL=e3ffb_%40milkdown_b2ac657c._.js.map