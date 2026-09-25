declare global {
    var globalAppointments: any[] | undefined;
    var globalBroadcastDatabase: any[] | undefined;
}

export const appointmentsDatabase = global.globalAppointments || [];
if (!global.globalAppointments) {
    global.globalAppointments = appointmentsDatabase;
}

export const broadcastDatabase = global.globalBroadcastDatabase || [];
if (!global.globalBroadcastDatabase) {
    global.globalBroadcastDatabase = broadcastDatabase;
}