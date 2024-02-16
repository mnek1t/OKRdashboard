//update the Completed__c field in Targets when Review__c with some KeyResult id will be inserted, deleted or undeleted
trigger ReviewUpdateTargets on Review__c (after insert, after delete, after undelete, after update) {

    Set<Id> targetsId = new Set<Id>();
    //from inserted Review__c, add its KeyResult__c (Id) to collection of ids
    if (Trigger.isInsert || Trigger.isUndelete || Trigger.isUpdate) {
        for (Review__c review : Trigger.new) {
            targetsId.add(review.Key_Result__c); // ex. get some a01Wy000002Bt4rIAC..
        }
    }
    //the same logic but for deletion
    if (Trigger.isDelete) {
        for (Review__c review : Trigger.old) {
            targetsId.add(review.Key_Result__c);
        }
    }
    //loop in obtained collection of ids
    List<Target__c> targets = new List<Target__c>();
    for (Id targetId : targetsId) {
        Target__c target = [SELECT Id, Completed__c FROM Target__c WHERE Key_Result__c = :targetId AND Name = 'Review'];
        target.Completed__c = [SELECT COUNT() FROM Review__c WHERE Key_Result__c = :targetId];
        targets.add(target);
    }
    update targets;
}