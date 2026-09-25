declare global {
    var globalAppointments: any[] | undefined;
    var globalBroadcastDatabase: any[] | undefined;
    var globalEstimateDatabase: any[] | undefined;
    var globalFollowUpDatabase: any[] | undefined;
    var globalInsuranceDatabase: any[] | undefined;
    var globalScoreDatabase: any[] | undefined;
    var globalScoredLeadsDatabase: any[] | undefined;
    var globalLeadsDatabase: any[] | undefined;
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

export const insuranceDatabase = global.globalInsuranceDatabase || [];
if (!global.globalInsuranceDatabase) {
    global.globalInsuranceDatabase = insuranceDatabase;
}

export const scoreDatabase = global.globalScoreDatabase || [];
if (!global.globalScoreDatabase) {
    global.globalScoreDatabase = scoreDatabase;
}

export const scoredLeadsDatabase = global.globalScoredLeadsDatabase || [];
if (!global.globalScoredLeadsDatabase) {
    global.globalScoredLeadsDatabase = scoredLeadsDatabase;
}

export const leadsDatabase = global.globalLeadsDatabase || [];
if (!global.globalLeadsDatabase) {
    global.globalLeadsDatabase = leadsDatabase;
}