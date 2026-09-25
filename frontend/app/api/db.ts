declare global {
    var globalAppointments: any[] | undefined;
    var globalBroadcastDatabase: any[] | undefined;
    var globalEstimateDatabase: any[] | undefined;
    var globalFollowUpDatabase: any[] | undefined;
}

export const appointmentsDatabase = global.globalAppointments || [];
if (!global.globalAppointments) {
    global.globalAppointments = appointmentsDatabase;
}

export const broadcastDatabase = global.globalBroadcastDatabase || [];
if (!global.globalBroadcastDatabase) {
    global.globalBroadcastDatabase = broadcastDatabase;
}

export const estimateDatabase = global.globalEstimateDatabase || [];
if (!global.globalEstimateDatabase) {
    global.globalEstimateDatabase = estimateDatabase;
}

export const followUpDatabase = global.globalFollowUpDatabase || [];
if (!global.globalFollowUpDatabase) {
    global.globalFollowUpDatabase = followUpDatabase;
}