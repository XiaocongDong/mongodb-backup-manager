const  AUTHSTATES = {
    AUTHENTICATING: Symbol(),
    UNAUTHENTICATED: Symbol(),
    AUTHENTICATED: Symbol()
};

const SUBMITSTATES = {
    UNSUBMITTED: Symbol(),
    SUBMITTING: Symbol(),
    SUBMITTED: Symbol()
};

export { AUTHSTATES, SUBMITSTATES };