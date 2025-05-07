/**
 * Wailey-library Protocol Buffer Wrapper
 * (Renamed from Baileys while maintaining identical functionality)
 */
export declare const proto: {
    WebMessageInfo: {
        fromObject: (obj: any) => {
            key: any;
            message: any;
            messageTimestamp: any;
            status: any;
            participant: any;
        };
        toObject: (msg: any) => {
            key: any;
            message: any;
            messageTimestamp: any;
            status: any;
            participant: any;
        };
    };
    Message: {
        fromObject: (obj: any) => any;
        toObject: (msg: any) => any;
    };
    MessageKey: {
        fromObject: (obj: any) => {
            remoteJid: any;
            fromMe: any;
            id: any;
            participant: any;
        };
    };
};
