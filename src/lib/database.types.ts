export type Database = {
  public: {
    Tables: {
      reports: {
        Row: {
          id: string;
          type: 'danger' | 'safe' | 'checkpoint' | 'incident' | 'resource';
          severity: 'critical' | 'high' | 'medium' | 'low' | null;
          location: string;
          description: string | null;
          reporter_id: string | null;
          anonymous: boolean | null;
          verification_count: number | null;
          verified: boolean | null;
          expires_at: string | null;
          photo_url: string | null;
          created_at: string | null;
          updated_at: string | null;
        };
        Insert: {
          id?: string;
          type: 'danger' | 'safe' | 'checkpoint' | 'incident' | 'resource';
          severity?: 'critical' | 'high' | 'medium' | 'low' | null;
          location: string;
          description?: string | null;
          reporter_id?: string | null;
          anonymous?: boolean | null;
          verification_count?: number | null;
          verified?: boolean | null;
          expires_at?: string | null;
          photo_url?: string | null;
          created_at?: string | null;
          updated_at?: string | null;
        };
        Update: {
          id?: string;
          type?: 'danger' | 'safe' | 'checkpoint' | 'incident' | 'resource';
          severity?: 'critical' | 'high' | 'medium' | 'low' | null;
          location?: string;
          description?: string | null;
          reporter_id?: string | null;
          anonymous?: boolean | null;
          verification_count?: number | null;
          verified?: boolean | null;
          expires_at?: string | null;
          photo_url?: string | null;
          created_at?: string | null;
          updated_at?: string | null;
        };
      };
      verifications: {
        Row: {
          id: string;
          report_id: string | null;
          user_id: string | null;
          device_id: string | null;
          is_accurate: boolean;
          notes: string | null;
          created_at: string | null;
        };
        Insert: {
          id?: string;
          report_id?: string | null;
          user_id?: string | null;
          device_id?: string | null;
          is_accurate: boolean;
          notes?: string | null;
          created_at?: string | null;
        };
        Update: {
          id?: string;
          report_id?: string | null;
          user_id?: string | null;
          device_id?: string | null;
          is_accurate?: boolean;
          notes?: string | null;
          created_at?: string | null;
        };
      };
      resources: {
        Row: {
          id: string;
          type: 'hospital' | 'shelter' | 'water' | 'food' | 'internet' | 'fuel';
          name: string;
          location: string;
          status: 'operational' | 'limited' | 'closed' | null;
          details: any | null;
          contact_info: string | null;
          capacity: number | null;
          last_verified: string | null;
          created_at: string | null;
          updated_at: string | null;
        };
        Insert: {
          id?: string;
          type: 'hospital' | 'shelter' | 'water' | 'food' | 'internet' | 'fuel';
          name: string;
          location: string;
          status?: 'operational' | 'limited' | 'closed' | null;
          details?: any | null;
          contact_info?: string | null;
          capacity?: number | null;
          last_verified?: string | null;
          created_at?: string | null;
          updated_at?: string | null;
        };
        Update: {
          id?: string;
          type?: 'hospital' | 'shelter' | 'water' | 'food' | 'internet' | 'fuel';
          name?: string;
          location?: string;
          status?: 'operational' | 'limited' | 'closed' | null;
          details?: any | null;
          contact_info?: string | null;
          capacity?: number | null;
          last_verified?: string | null;
          created_at?: string | null;
          updated_at?: string | null;
        };
      };
      journalist_profiles: {
        Row: {
          user_id: string;
          organization: string | null;
          emergency_contact: string | null;
          check_in_frequency: string | null;
          last_check_in: string | null;
          created_at: string | null;
        };
        Insert: {
          user_id: string;
          organization?: string | null;
          emergency_contact?: string | null;
          check_in_frequency?: string | null;
          last_check_in?: string | null;
          created_at?: string | null;
        };
        Update: {
          user_id?: string;
          organization?: string | null;
          emergency_contact?: string | null;
          check_in_frequency?: string | null;
          last_check_in?: string | null;
          created_at?: string | null;
        };
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      get_reports_in_bounds: {
        Args: {
          lat_min: number;
          lat_max: number;
          lng_min: number;
          lng_max: number;
        };
        Returns: {
          id: string;
          type: 'danger' | 'safe' | 'checkpoint' | 'incident' | 'resource';
          severity: 'critical' | 'high' | 'medium' | 'low' | null;
          description: string | null;
          latitude: number;
          longitude: number;
          verified: boolean | null;
          verification_count: number | null;
          created_at: string | null;
        }[];
      };
      find_nearest_resources: {
        Args: {
          user_lat: number;
          user_lng: number;
          resource_type_filter?: 'hospital' | 'shelter' | 'water' | 'food' | 'internet' | 'fuel' | null;
          max_distance_meters?: number;
          limit_count?: number;
        };
        Returns: {
          id: string;
          name: string;
          type: 'hospital' | 'shelter' | 'water' | 'food' | 'internet' | 'fuel';
          status: 'operational' | 'limited' | 'closed' | null;
          distance_meters: number;
          latitude: number;
          longitude: number;
          details: any | null;
        }[];
      };
    };
    Enums: {
      [_ in never]: never;
    };
  };
};