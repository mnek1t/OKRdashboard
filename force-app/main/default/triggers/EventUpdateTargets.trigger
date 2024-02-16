trigger EventUpdateTargets on Event (after insert, after delete, after undelete,after update) {
    Set<Id> targetsId = new Set<Id>();
    //from inserted Event, add its KeyResult__c (Id) to collection of ids
    if (Trigger.isInsert || Trigger.isUndelete || Trigger.isUpdate) {
        for (Event event : Trigger.new) {
            targetsId.add(event.WhatId); // ex. get some a01Wy000002Bt4rIAC..
        }
    }
    //the same logic but for deletion
    if (Trigger.isDelete) {
        for (Event event : Trigger.old) {
            targetsId.add(event.WhatId);
        }
    }
    //loop in obtained collection of ids
    List<Target__c> targets = new List<Target__c>();
    for (Id targetId : targetsId) {
        Target__c target = [SELECT Id, Completed__c FROM Target__c WHERE Key_Result__c = :targetId AND Name = 'Event'];
        target.Completed__c = [SELECT COUNT() FROM Event WHERE WhatId = :targetId];
        targets.add(target);
    }
    update targets;
}