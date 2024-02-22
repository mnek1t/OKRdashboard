trigger SurveyUpdateTargets on Survey__c (after insert, after delete, after undelete, after update) {
    Set<Id> targetsId = new Set<Id>();
    //from inserted Survey__c, add its KeyResult__c (Id) to collection of ids
    if (Trigger.isInsert || Trigger.isUndelete || Trigger.isUpdate) {
        for (Survey__c survey : Trigger.new) {
            targetsId.add(survey.Key_Result__c); // ex. get some a01Wy000002Bt4rIAC..
        }
    }
    //the same logic but for deletion
    if (Trigger.isDelete) {
        for (Survey__c survey : Trigger.old) {
            targetsId.add(survey.Key_Result__c);
        }
    }
    //loop in obtained collection of ids
    List<Target__c> targets = new List<Target__c>();
    for (Id targetId : targetsId) {
        List<Target__c> targetList =  [SELECT Id, Completed__c FROM Target__c WHERE Key_Result__c = :targetId AND Name = 'Survey'];
        if(!targetList.isEmpty()) 
        {
            Target__c target = targetList[0];
            target.Completed__c = [SELECT COUNT() FROM Survey__c WHERE Key_Result__c = :targetId];
            targets.add(target);
        }
       
    }
    update targets;
}