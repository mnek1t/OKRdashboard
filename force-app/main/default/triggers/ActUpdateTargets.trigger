trigger ActUpdateTargets on Act__c (after insert, after delete, after undelete, after update) {
    Set<Id> targetsId = new Set<Id>();
    //from inserted Act__c, add its KeyResult__c (Id) to collection of ids
    if (Trigger.isInsert || Trigger.isUndelete || Trigger.isUpdate) {
        for (Act__c act : Trigger.new) {
            targetsId.add(act.Key_Result__c); // ex. get some a01Wy000002Bt4rIAC..
        }
    }
    //the same logic but for deletion
    if (Trigger.isDelete) {
        for (Act__c act : Trigger.old) {
            targetsId.add(act.Key_Result__c);
        }
    }
    //loop in obtained collection of ids
    List<Target__c> targets = new List<Target__c>();
    for (Id targetId : targetsId) {
        Target__c target = [SELECT Id, Completed__c FROM Target__c WHERE Key_Result__c = :targetId AND Name = 'Act'];
        target.Completed__c = [SELECT COUNT() FROM Act__c WHERE Key_Result__c = :targetId];
        targets.add(target);
    }
    update targets;
}