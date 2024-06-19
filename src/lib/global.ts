import { type ConnectionStatus, TriplitClient } from "@triplit/client";
import { schema } from "../data/schema-triplit";
import { createActor } from "xstate";
import { machine as machineApp } from "$lib/machine-app";
import { machine as machineSettings } from "$lib/machine-settings";
import { createToastManagerDummy, createToastManagerSkeleton } from '$lib/toast-manager';
import { getToastStore } from '@skeletonlabs/skeleton';
import { createModalManagerDummy } from '$lib/modal-manager';

const globalClientOptions = JSON.parse(
  localStorage.getItem("cryptaa.globalClientOptions") ??
    `{"serverUrl": "", "token": ""}`,
);
export const globalClient = new TriplitClient({
  schema,
  storage: "indexeddb",
  ...globalClientOptions,
});
export const globalAppActor = createActor(machineApp, {
  input: {
    client: globalClient,
    toastManager: createToastManagerDummy(),
    modalManager: createModalManagerDummy(),
  }
});
globalAppActor.start();

export const globalActorSettings = createActor(machineSettings, {
  input: {
    connectionToken: globalClientOptions.token,
    connectionURL: globalClientOptions.serverUrl,
  },
});
globalActorSettings.start();

globalClient.onConnectionStatusChange((status) => {
  switch (status) {
    case "OPEN":
      globalActorSettings.send({ type: "Succeeded" });
      break;
    case "CLOSED":
      globalActorSettings.send({ type: "Failed" });
      break;
  }
});
