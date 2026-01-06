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
          role: 'user' | 'admin';
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          full_name?: string;
          subscription_tier?: 'free' | 'pro' | 'enterprise';
          subscription_status?: 'trial' | 'active' | 'cancelled' | 'expired';
          trial_ends_at?: string | null;
          role?: 'user' | 'admin';
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          full_name?: string;
          subscription_tier?: 'free' | 'pro' | 'enterprise';
          subscription_status?: 'trial' | 'active' | 'cancelled' | 'expired';
          trial_ends_at?: string | null;
          role?: 'user' | 'admin';
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
      pages: {
        Row: {
          id: string;
          slug: string;
          title: string;
          content: any;
          template: string;
          published: boolean;
          meta_title: string;
          meta_description: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          slug: string;
          title: string;
          content?: any;
          template?: string;
          published?: boolean;
          meta_title?: string;
          meta_description?: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          slug?: string;
          title?: string;
          content?: any;
          template?: string;
          published?: boolean;
          meta_title?: string;
          meta_description?: string;
          created_at?: string;
          updated_at?: string;
        };
      };
      site_settings: {
        Row: {
          id: string;
          key: string;
          value: any;
          updated_at: string;
        };
        Insert: {
          id?: string;
          key: string;
          value?: any;
          updated_at?: string;
        };
        Update: {
          id?: string;
          key?: string;
          value?: any;
          updated_at?: string;
        };
      };
      admin_logs: {
        Row: {
          id: string;
          admin_id: string | null;
          action: string;
          resource_type: string | null;
          resource_id: string | null;
          details: any;
          created_at: string;
        };
        Insert: {
          id?: string;
          admin_id?: string | null;
          action: string;
          resource_type?: string | null;
          resource_id?: string | null;
          details?: any;
          created_at?: string;
        };
        Update: {
          id?: string;
          admin_id?: string | null;
          action?: string;
          resource_type?: string | null;
          resource_id?: string | null;
          details?: any;
          created_at?: string;
        };
      };
      design_conversions: {
        Row: {
          id: string;
          user_id: string;
          name: string;
          image_url: string;
          conversion_type: 'html' | 'divi' | 'elementor';
          status: 'pending' | 'analyzing' | 'generating' | 'completed' | 'failed';
          prompt: string;
          result: any;
          companion_plugin: any | null;
          needs_companion_plugin: boolean;
          analysis: any;
          error_message: string | null;
          created_at: string;
          updated_at: string;
          completed_at: string | null;
        };
        Insert: {
          id?: string;
          user_id: string;
          name: string;
          image_url: string;
          conversion_type?: 'html' | 'divi' | 'elementor';
          status?: 'pending' | 'analyzing' | 'generating' | 'completed' | 'failed';
          prompt?: string;
          result?: any;
          companion_plugin?: any | null;
          needs_companion_plugin?: boolean;
          analysis?: any;
          error_message?: string | null;
          created_at?: string;
          updated_at?: string;
          completed_at?: string | null;
        };
        Update: {
          id?: string;
          user_id?: string;
          name?: string;
          image_url?: string;
          conversion_type?: 'html' | 'divi' | 'elementor';
          status?: 'pending' | 'analyzing' | 'generating' | 'completed' | 'failed';
          prompt?: string;
          result?: any;
          companion_plugin?: any | null;
          needs_companion_plugin?: boolean;
          analysis?: any;
          error_message?: string | null;
          created_at?: string;
          updated_at?: string;
          completed_at?: string | null;
        };
      };
      divi_modules: {
        Row: {
          id: string;
          name: string;
          slug: string;
          category: string;
          capabilities: any;
          is_baseline: boolean;
          created_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          slug: string;
          category?: string;
          capabilities?: any;
          is_baseline?: boolean;
          created_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          slug?: string;
          category?: string;
          capabilities?: any;
          is_baseline?: boolean;
          created_at?: string;
        };
      };
      elementor_widgets: {
        Row: {
          id: string;
          name: string;
          slug: string;
          category: string;
          capabilities: any;
          is_baseline: boolean;
          created_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          slug: string;
          category?: string;
          capabilities?: any;
          is_baseline?: boolean;
          created_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          slug?: string;
          category?: string;
          capabilities?: any;
          is_baseline?: boolean;
          created_at?: string;
        };
      };
    };
  };
}
