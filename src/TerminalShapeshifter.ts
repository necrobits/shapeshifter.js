import _ from 'lodash';
import { ValueMappingFunction, TerminalShapeshifterConfig, TerminalShapeshifterFullConfig } from "./types";

export class TerminalShapeshifter {
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
