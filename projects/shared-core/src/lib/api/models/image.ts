import {ImageStatus} from '../types/main-enums';

export interface Image {
  id: string;
  name: string;
  isMain: boolean;
  description: string;
  url: string;
  thumbnailUrl: string;
  signedUrl: string;
  status: ImageStatus;
  metadata: string;
}
