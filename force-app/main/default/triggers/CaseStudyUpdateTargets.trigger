trigger CaseStudyUpdateTargets on Case_Study__c (after insert, after delete, after undelete, after update) {
    Set<Id> targetsId = new Set<Id>();
    //from inserted Case_Study__c, add its KeyResult__c (Id) to collection of ids
    if (Trigger.isInsert || Trigger.isUndelete || Trigger.isUpdate) {
        for (Case_Study__c caseStudy : Trigger.new) {
            targetsId.add(caseStudy.Key_Result__c); // ex. get some a01Wy000002Bt4rIAC..
        }
    }
    //the same logic but for deletion
    if (Trigger.isDelete) {
        for (Case_Study__c caseStudy : Trigger.old) {
            targetsId.add(caseStudy.Key_Result__c);
        }
    }
    //loop in obtained collection of ids
    List<Target__c> targets = new List<Target__c>();
    for (Id targetId : targetsId) {
        Target__c target = [SELECT Id, Completed__c FROM Target__c WHERE Key_Result__c = :targetId AND Name = 'Case Study'];
        target.Completed__c = [SELECT COUNT() FROM Case_Study__c WHERE Key_Result__c = :targetId];
        targets.add(target);
    }
    update targets;
}