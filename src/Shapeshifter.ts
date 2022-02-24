import _, { extend } from "lodash";

export class Shapeshifter{
    private constructor(private schema: Map<string, TerminalShapeshifter | Shapeshifter> = new Map(), private toKey?: string) { }

    public transform(obj: any) {
        if (_.isArray(obj)) {
            return _.map(obj, (o) => this.transform(o));
        }
        const result = {};
        for (const [key, transformer] of this.schema.entries()) {
            if (Shapeshifter.isVirtualKey(key) || _.hasIn(obj, key)) {
                result[transformer.targetKey] = transformer.transform(obj[key], obj);
            }
        }
        return result;
    }

    public static create(config: ShapeshiftingSchema): Shapeshifter {
        return Shapeshifter._create(config);
    }

    get targetKey() {
        return this.toKey;
    }

    private static isVirtualKey(key: string): boolean {
        return /^__virtual\w*__$/.test(key)
    }


    private static _create(config: ShapeshiftingSchema, toKey?: string) {
        const map = new Map();
        for (const [key, value] of Object.entries(config)) {
            if (value.hasOwnProperty('__nested__') || value.hasOwnProperty('__array__')) {
                const targetKey = value['__to__'] || key;
                map.set(key, Shapeshifter._create(<ShapeshiftingSchema>value, targetKey));
            } else if (Shapeshifter.isVirtualKey(key)) {
                if (!value.hasOwnProperty('to') || !value.hasOwnProperty('mapping')) {
                    throw new Error(`Virtualized key ${key} must use the full config syntax (with 'to' and 'mapping')`);
                }
                const { to, mapping } = <TerminalShapeshifterFullConfig>value;
                map.set(key, TerminalShapeshifter.create(key, { to, mapping }));
            } else {
                map.set(key, TerminalShapeshifter.create(key, <TerminalShapeshifterConfig>value));
            }
        }
        return new Shapeshifter(map, toKey);
    }
}

type ValueMappingFunction = (value: any, obj: any) => any;

type ShapeshiftingSchemaKey = Exclude<string, number | symbol | '__nested__' | '__array__' | '__to__'>;

type TerminalShapeshifterFullConfig<InputType = any> = {
    to: string;
    mapping: ValueMappingFunction;
}

type TerminalShapeshifterConfig = string | boolean | true | ValueMappingFunction | TerminalShapeshifterFullConfig;

type ShapeshiftingSchemaBody = {
    [K in ShapeshiftingSchemaKey]: ShapeshiftingSchema| TerminalShapeshifterConfig;
}

type ShapeshiftingSchema = {
    __nested__?: boolean;
    __array__?: boolean;
    __to__?: string;
} & ShapeshiftingSchemaBody;

class TerminalShapeshifter {
    private constructor(private toKey: string, private mappingFn: ValueMappingFunction) {
    }

    transform(value: any, obj?: any) {
        return this.mappingFn(value, obj);
    }

    get targetKey() {
        return this.toKey;
    }

    static create(fromKey: string, config: TerminalShapeshifterConfig): TerminalShapeshifter {
        if (_.isString(config)) {
            return new TerminalShapeshifter(<string>config, (value, obj) => value);
        } else if (_.isBoolean(config)) {
            return new TerminalShapeshifter(fromKey, (value, obj) => value);
        } else if (_.isFunction(config)) {
            return new TerminalShapeshifter(fromKey, <ValueMappingFunction>config);
        } else if (_.isObject(config)) {
            const { to, mapping } = <TerminalShapeshifterFullConfig>config;
            return new TerminalShapeshifter(to, mapping);
        }
    }
}
