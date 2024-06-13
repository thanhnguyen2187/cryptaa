import { assign, setup } from "xstate";

export const machine = setup({
  types: {
    input: {} as {
      connectionURL: string;
      connectionToken: string;
    },
    context: {} as {
      connectionURL: string;
      connectionToken: string;
    },
    events: {} as
      | {
          type: "TabSwitchedData";
        }
      | {
          type: "TabSwitchedMiscellanies";
        }
      | {
          type: "Failed";
        }
      | {
          type: "Succeeded";
        }
      | {
          type: "Retry";
        }
      | {
          type: "ConnectionURLSet";
          value: string;
        }
      | {
          type: "ConnectionTokenSet";
          value: string;
        },
  },
  guards: {
    IsConnectionStringsEmpty: ({ context }) => {
      return context.connectionURL === "" || context.connectionToken === "";
    },
  },
}).createMachine({
  context: ({ input }) => ({
    connectionURL: input.connectionURL,
    connectionToken: input.connectionToken,
  }),
  initial: "TabData",
  on: {
    TabSwitchedData: ".TabData",
    TabSwitchedMiscellanies: ".TabMiscellanies",
  },
  states: {
    TabData: {
      type: "parallel",
      states: {
        ConnectionState: {
          initial: "Transient",
          on: {
            Failed: ".Error",
            Succeeded: ".Connected",
            Retry: ".Connecting",
            ConnectionURLSet: {
              target: ".Transient",
              actions: assign({
                connectionURL: ({ event }) => event.value,
              }),
            },
            ConnectionTokenSet: {
              target: ".Transient",
              actions: assign({
                connectionToken: ({ event }) => event.value,
              }),
            },
          },
          states: {
            Transient: {
              always: [
                {
                  guard: "IsConnectionStringsEmpty",
                  target: "None",
                },
                {
                  target: "Connecting",
                },
              ],
            },
            None: {},
            Connecting: {},
            Error: {},
            Connected: {},
          },
        },
      },
    },
    TabMiscellanies: {},
  },
});
