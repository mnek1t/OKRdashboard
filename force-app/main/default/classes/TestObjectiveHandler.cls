@isTest
private with sharing class TestObjectiveHandler {
    @isTest
    private static void TestSendEmailToUser()
    {
        Objective__c newObj = new Objective__c(Name = 'Test', 
        Start_Date__c = Date.valueOf('2024-02-01'), 
        End_Date__c = Date.valueOf('2024-02-03'),
        AssignedTo__c = '005Wy000000A649IAC'
        );  
        Test.startTest();
        insert newObj;
        Test.stopTest();
        System.assertEquals(1, Limits.getEmailInvocations()); //does not work as it is not build in to track sending email, try to use mocking 
    } 
}