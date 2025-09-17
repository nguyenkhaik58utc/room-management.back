// src/common/decorators/custom.decorators.ts

/**
 * Class decorator - log tên class khi được tạo
 */
export function LogClass(target: abstract new (...args: any[]) => unknown): void {
    console.log(`Class decorator: ${target.name} đã được tạo`);
}

/**
 * Property decorator - biến property thành readonly
 */
export function Readonly(target: object, propertyKey: string): void {
    Object.defineProperty(target, propertyKey, {
        writable: false
    });
}

/**
 * Accessor decorator - log khi getter được gọi
 */
export function LogAccess(
    target: object,
    propertyKey: string,
    descriptor: PropertyDescriptor
): void {
    const originalGet = descriptor.get;
    descriptor.get = function (this: unknown) {
        console.log(`Truy cập vào getter: ${propertyKey}`);
        return originalGet?.apply(this);
    };
}

/**
 * Method decorator - delay trước khi thực thi
 */
export function DelayGetInfo(ms: number) {
    return function (
        target: object,
        propertyKey: string,
        descriptor: PropertyDescriptor
    ): void {
        const originalMethod = descriptor.value as (...args: any[]) => unknown;
        descriptor.value = async function (this: unknown, ...args: any[]) {
            console.log(`Đợi ${ms}ms trước khi chạy ${propertyKey}`);
            await new Promise((res) => setTimeout(res, ms));
            return originalMethod.apply(this, args);
        };
    };
}

/**
 * Parameter decorator - log thông tin parameter
 */
export function MyParamDecorator(
    target: object,
    propertyKey: string | symbol,
    parameterIndex: number
): void {
    console.log("Class:", target.constructor.name);
    console.log("Method:", String(propertyKey));
    console.log("Parameter index:", parameterIndex);
}

/**
 * Property decorator - chỉ cho phép số dương
 */
export function PositiveNumber(target: object, propertyKey: string): void {
    let value: number;

    Object.defineProperty(target, propertyKey, {
        get() {
            return value;
        },
        set(newValue: number) {
            if (typeof newValue !== 'number' || newValue <= 0) {
                throw new Error(`${propertyKey} phải là số > 0`);
            }
            value = newValue;
        },
        enumerable: true,
        configurable: true
    });
}
