const unknownArtistImage = require("../../assets/unknown_artist.png");
const unknownTrackImage = require("../../assets/unknown_track.png");
import { Image } from "react-native";

export const unknownTrackImageUri =
  Image.resolveAssetSource(unknownTrackImage).uri;
export const unknownArtistImageUri =
  Image.resolveAssetSource(unknownArtistImage).uri;
