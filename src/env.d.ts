/// <reference path="../.astro/types.d.ts" />

interface ImportMetaEnv {
  readonly PUBLIC_GA_MEASUREMENT_ID?: string;
  readonly PUBLIC_GOOGLE_ADS_ID?: string;
  readonly PUBLIC_GOOGLE_ADS_OUTBOUND_CONVERSION_ID?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
