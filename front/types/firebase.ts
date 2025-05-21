// 이벤트 이름 타입 정의
export type AnalyticsEventName = 'button_click' | 'question_send';
// | 'login'
// | 'signup'
// | 'logout'
// | 'button_click'
// | 'item_view'
// | 'item_select'
// | 'search'
// | 'filter_apply'
// | 'share'
// | 'error_occurred';

// 화면 이름 타입 정의
export type AnalyticsScreenName =
    | 'HomeScreen'
    | 'ProductDetailScreen'
    | 'WishlistScreen'
    | 'MyPageScreen'
    | 'SubscriptionScreen'
    | 'SubscriptionHistoryScreen';

// 이벤트 파라미터 타입 정의
export interface AnalyticsEventParams {
    button_name?: string;
    screen?: string;
    item_id?: string;
    item_name?: string;
    category?: string;
    search_term?: string;
    error_message?: string;
    [key: string]: any;
}
