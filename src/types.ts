
export type ValueMappingFunction = (value: any, obj: any) => any;

export type ShapeshiftingSchemaKey = Exclude<string, number | symbol | '__nested__' | '__array__' | '__to__'>;

export type TerminalShapeshifterFullConfig<InputType = any> = {
    to: string;
    mapping: ValueMappingFunction;
}

export type TerminalShapeshifterConfig = string | boolean | true | ValueMappingFunction | TerminalShapeshifterFullConfig;

export type ShapeshiftingSchemaBody = {
    [K in ShapeshiftingSchemaKey]: ShapeshiftingSchema| TerminalShapeshifterConfig;
}

export type ShapeshiftingSchema = {
    __nested__?: boolean;
    __array__?: boolean;
    __to__?: string;
} & ShapeshiftingSchemaBody;
