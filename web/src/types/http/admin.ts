export interface HTTPAdminUserinfo {
    avatar: string;
    mail: string;
    name: string;
    phone: string;
    uid: number;
}

export interface HTTPAdminHistoryPage {
   history: {
       id: string;
       uid: number;
       group_id: string;
       title: string;
       question: string;
       answer: string;
       created_at: string;
       updated_at: string;
       deleted_at: string;
   };
   total: number;

}