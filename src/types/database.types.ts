export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          full_name: string;
          subscription_tier: 'free' | 'pro' | 'enterprise';
          subscription_status: 'trial' | 'active' | 'cancelled' | 'expired';
          trial_ends_at: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          full_name?: string;
          subscription_tier?: 'free' | 'pro' | 'enterprise';
          subscription_status?: 'trial' | 'active' | 'cancelled' | 'expired';
          trial_ends_at?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          full_name?: string;
          subscription_tier?: 'free' | 'pro' | 'enterprise';
          subscription_status?: 'trial' | 'active' | 'cancelled' | 'expired';
          trial_ends_at?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      plugin_requests: {
        Row: {
          id: string;
          user_id: string;
          plugin_name: string;
          plugin_type: string;
          description: string;
          custom_features: any;
          theme_compatibility: any;
          reference_images: any;
          builder_type: string | null;
          builder_config: any;
          status: 'pending' | 'generating' | 'testing' | 'completed' | 'failed';
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          plugin_name: string;
          plugin_type: string;
          description?: string;
          custom_features?: any;
          theme_compatibility?: any;
          reference_images?: any;
          builder_type?: string | null;
          builder_config?: any;
          status?: 'pending' | 'generating' | 'testing' | 'completed' | 'failed';
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          plugin_name?: string;
          plugin_type?: string;
          description?: string;
          custom_features?: any;
          theme_compatibility?: any;
          reference_images?: any;
          builder_type?: string | null;
          builder_config?: any;
          status?: 'pending' | 'generating' | 'testing' | 'completed' | 'failed';
          created_at?: string;
          updated_at?: string;
        };
      };
      generated_plugins: {
        Row: {
          id: string;
          request_id: string;
          user_id: string;
          plugin_file_url: string;
          version: string;
          test_site_url: string | null;
          download_count: number;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          request_id: string;
          user_id: string;
          plugin_file_url?: string;
          version?: string;
          test_site_url?: string | null;
          download_count?: number;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          request_id?: string;
          user_id?: string;
          plugin_file_url?: string;
          version?: string;
          test_site_url?: string | null;
          download_count?: number;
          created_at?: string;
          updated_at?: string;
        };
      };
      subscriptions: {
        Row: {
          id: string;
          user_id: string;
          stripe_customer_id: string;
          stripe_subscription_id: string;
          plan_type: 'free' | 'pro' | 'enterprise';
          status: 'active' | 'cancelled' | 'past_due' | 'trialing';
          current_period_start: string;
          current_period_end: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          stripe_customer_id?: string;
          stripe_subscription_id?: string;
          plan_type?: 'free' | 'pro' | 'enterprise';
          status?: 'active' | 'cancelled' | 'past_due' | 'trialing';
          current_period_start?: string;
          current_period_end?: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          stripe_customer_id?: string;
          stripe_subscription_id?: string;
          plan_type?: 'free' | 'pro' | 'enterprise';
          status?: 'active' | 'cancelled' | 'past_due' | 'trialing';
          current_period_start?: string;
          current_period_end?: string;
          created_at?: string;
          updated_at?: string;
        };
      };
    };
  };
}
