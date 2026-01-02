declare const act: (fn: () => void) => void;

declare const export_: { act: typeof act };

export = export_;
