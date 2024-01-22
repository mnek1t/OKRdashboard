public with sharing class UserHandler {
    @AuraEnabled(cacheable=true)
    public static List<Map<String,String>> getUsers(){
        List<Map<String,String>> actualUsers = new List<Map<String,String>>();
        for(User us :[SELECT Id, Name FROM User  WHERE isActive=true]){
            Map<String,String> option = new Map<String,String>{
                'label'=> us.Name,
                'value' => us.Id
            };
            actualUsers.add(option);
        }
        return actualUsers;
    }
    @AuraEnabled
    public static User getUser(Id userId){
        return [SELECT Name FROM User WHERE Id=:userId LIMIT 1];
    }
}