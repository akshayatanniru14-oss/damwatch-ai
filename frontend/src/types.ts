export interface Asset {
  name: string;
  type: string;
  state: string;
  coordinates: {
    lat: number;
    lon: number;
  };
}

export interface AnalyzeRequest {
  images: string[];
  note: string;
  asset: Asset;
  coordinates?: {
    lat: number;
    lon: number;
  };
  water_level?: string;
}

export interface AnalyzeResponse {
  issue_detected: string;
  issue_category: 'seepage' | 'crack' | 'debris_blockage' | 'encroachment' | 'erosion' | 'gauge_damage' | 'water_level_anomaly' | 'vegetation' | 'other' | 'none_visible';
  severity: 'low' | 'medium' | 'high' | 'critical';
  evidence_strength: 'weak' | 'moderate' | 'strong';
  evidence_reason: string;
  visual_evidence: string[];
  recommended_action: string;
  escalation: string;
  data_gaps: string[];
  checklist: string[];
}

export interface CompareRequest {
  old_image: string;
  new_image: string;
  old_note: string;
  new_note: string;
}

export interface CompareResponse {
  change_detected: boolean;
  change_summary: string;
  changes: {
    observation: string;
    direction: 'worsened' | 'improved' | 'unchanged';
  }[];
  updated_severity: 'low' | 'medium' | 'high' | 'critical';
  recommended_action: string;
}