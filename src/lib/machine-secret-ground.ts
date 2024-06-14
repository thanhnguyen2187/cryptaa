import { assign, fromPromise, setup } from "xstate";
import { aesGcmDecrypt, aesGcmEncrypt } from "../data/encryption";
import type { ToastStore } from "@skeletonlabs/skeleton";

export type Mode = "encryption" | "decryption";

const encryptLogic = fromPromise(
  async ({
    input,
  }: { input: { text: string; password: string } }): Promise<string> => {
    return await aesGcmEncrypt(input.text, input.password);
  },
);

const decryptLogic = fromPromise(
  async ({
    input,
  }: { input: { text: string; password: string } }): Promise<string> => {
    return await aesGcmDecrypt(input.text, input.password);
  },
);

export const machine = setup({
  types: {
    context: {} as {
      text: string;
      password: string;
      textTarget: string;
      toastStore: ToastStore;
      mode: Mode;
    },
    events: {} as
      | { type: "SwapMode" }
      | { type: "SetText"; value: string }
      | { type: "SetPassword"; value: string }
      | { type: "Encrypt" }
      | { type: "Decrypt" },
    input: {} as {
      toastStore: ToastStore;
    },
  },
  actors: {
    encryptLogic,
  },
  guards: {
    IsTextEmpty: ({ context }) => context.text === "",
    IsPasswordEmpty: ({ context }) => context.password === "",
    IsBothEmpty: ({ context }) =>
      context.text === "" && context.password === "",
    IsEncrypting: ({ context }) => context.mode === "encryption",
    IsDecrypting: ({ context }) => context.mode === "decryption",
    IsWrongPassword: (_, params: { error: Error }) =>
      params.error.message === "Decrypt failed",
    IsWrongFormat: (_, params: { error: Error }) =>
      params.error.message === "Invalid ciphertext",
  },
  actions: {},
}).createMachine({
  id: "MachineSecretGround",
  context: ({ input }) => ({
    text: "",
    password: "",
    textTarget: "",
    toastStore: input.toastStore,
    mode: "encryption",
  }),
  initial: "Idling",
  on: {},
  states: {
    Idling: {
      on: {
        Encrypt: {
          target: "#MachineSecretGround.Inputs",
        },
        SwapMode: {
          actions: assign({
            mode: ({ context }) =>
              context.mode === "encryption" ? "decryption" : "encryption",
            text: ({ context }) => context.textTarget,
            textTarget: () => "",
          }),
        },
        SetText: {
          actions: assign({
            text: ({ event }) => event.value,
          }),
        },
        SetPassword: {
          actions: assign({
            password: ({ event }) => event.value,
          }),
        },
      },
    },
    Inputs: {
      initial: "Transient",
      on: {
        SetText: {
          actions: assign({
            text: ({ event }) => event.value,
          }),
        },
        SetPassword: {
          actions: assign({
            password: ({ event }) => event.value,
          }),
        },
      },
      states: {
        Transient: {
          always: [
            {
              guard: "IsBothEmpty",
              target: "BothEmpty",
            },
            {
              guard: "IsTextEmpty",
              target: "TextEmpty",
            },
            {
              guard: "IsPasswordEmpty",
              target: "PasswordEmpty",
            },
            {
              target: "TransientEnd",
            },
          ],
        },
        TextEmpty: {
          entry: ({ context }) => {
            context.toastStore.trigger({
              message: "Text should not be empty!",
              timeout: 2000,
              hideDismiss: true,
            });
          },
          always: "#MachineSecretGround.Idling",
        },
        PasswordEmpty: {
          entry: ({ context }) => {
            context.toastStore.trigger({
              message: "Password should not be empty!",
              timeout: 2000,
              hideDismiss: true,
            });
          },
          always: "#MachineSecretGround.Idling",
        },
        BothEmpty: {
          entry: ({ context }) => {
            context.toastStore.trigger({
              message: "Inputs should not be empty!",
              timeout: 2000,
              hideDismiss: true,
            });
          },
          always: "#MachineSecretGround.Idling",
        },
        TransientEnd: {
          always: "#MachineSecretGround.Functioning",
        },
      },
    },
    Functioning: {
      initial: "Transient",
      states: {
        Transient: {
          always: [
            {
              guard: "IsEncrypting",
              target: "Encrypting",
            },
            {
              target: "Decrypting",
            },
          ],
        },
        Encrypting: {
          invoke: {
            src: encryptLogic,
            input: ({ context }) => ({
              text: context.text,
              password: context.password,
            }),
            onDone: {
              target: "TransientEnd",
              actions: assign({
                textTarget: ({ event }) => event.output as string,
              }),
            },
            onError: {
              target: "EncryptionError",
            },
          },
        },
        EncryptionError: {},
        Decrypting: {
          invoke: {
            src: decryptLogic,
            input: ({ context }) => ({
              text: context.text,
              password: context.password,
            }),
            onDone: {
              target: "TransientEnd",
              actions: assign({
                textTarget: ({ event }) => event.output as string,
              }),
            },
            onError: [
              {
                guard: {
                  type: "IsWrongPassword",
                  params: ({ event }) => ({ error: event.error as Error }),
                },
                target: "DecryptionWrongPassword",
              },
              {
                guard: {
                  type: "IsWrongFormat",
                  params: ({ event }) => ({ error: event.error as Error }),
                },
                target: "DecryptionWrongText",
              },
              {
                actions: ({ event }) => console.error(event.error),
                target: "DecryptionError",
              }
            ],
          },
        },
        DecryptionWrongPassword: {
          entry: ({ context }) => {
            context.toastStore.trigger({
              message: "Please recheck your password!",
              timeout: 2000,
              hideDismiss: true,
            });
          },
          always: "TransientEnd",
        },
        DecryptionWrongText: {
          entry: ({ context }) => {
            context.toastStore.trigger({
              message: "Please recheck your text's content or format!",
              timeout: 2000,
              hideDismiss: true,
            });
          },
          always: "TransientEnd",
        },
        DecryptionError: {
          entry: ({ context }) => {
            context.toastStore.trigger({
              message: "Unknown error happened",
              timeout: 2000,
              hideDismiss: true,
            });
          },
          always: "TransientEnd",
        },
        TransientEnd: {
          always: "#MachineSecretGround.Idling",
        },
      },
    },
  },
});
