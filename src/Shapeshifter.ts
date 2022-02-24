import _ from "lodash";
import { TerminalShapeshifter } from "./TerminalShapeshifter";
import { ShapeshiftingSchema, TerminalShapeshifterFullConfig, TerminalShapeshifterConfig } from "./types";

/**
 * Shapeshifter can transform an object from one shape to another
 *  by following the provided transformation schema.
 * 
 * You can create a Shapeshifter by called Shapeshifter.create(schema)
 * 
 */
export class Shapeshifter{
    private constructor(private schema: Map<string, TerminalShapeshifter | Shapeshifter> = new Map(), private toKey?: string) { }

    /**
     * Transform the object using the provided schema
     * 
     * @param obj The object to transform
     */
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

    /**
     * Create a Shapeshifter from a schema.
     * 
     * @param config The schema to use for the transformation
     */
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
