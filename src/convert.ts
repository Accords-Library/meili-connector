import { payload } from "src/services";
import type { MeiliDocument } from "src/shared/meilisearch/types";
import { Collections } from "src/shared/payload/constants";
import type {
  EndpointAudio,
  EndpointChronologyEvent,
  EndpointCollectible,
  EndpointFile,
  EndpointFolder,
  EndpointImage,
  EndpointPage,
  EndpointRecorder,
  EndpointVideo,
} from "src/shared/payload/endpoint-types";
import {
  formatInlineTitle,
  formatRichTextContentToString,
} from "src/shared/payload/format";
import {
  SDKEndpointNames,
  type PayloadSDKResponse,
} from "src/shared/payload/sdk";
import type { EndpointChange } from "src/shared/payload/webhooks";

const convertPageToDocument = ({
  data,
  endpointCalled,
}: PayloadSDKResponse<EndpointPage>): MeiliDocument[] =>
  data.translations.map<MeiliDocument>(
    ({ language, pretitle, title, subtitle, content, summary }) => ({
      docId: `${data.id}_${language}`,
      distinctId: data.id,
      languages: data.translations.map(({ language }) => language),
      title: formatInlineTitle({ pretitle, title, subtitle }),
      content: `${
        summary ? `${formatRichTextContentToString(summary)}\n\n\n` : ""
      }${formatRichTextContentToString(content)}`,
      updatedAt: Date.parse(data.updatedAt),
      type: Collections.Pages,
      endpointCalled,
      data,
    })
  );

const convertCollectibleToDocument = ({
  data,
  endpointCalled,
}: PayloadSDKResponse<EndpointCollectible>): MeiliDocument[] =>
  data.translations.map<MeiliDocument>(
    ({ language, pretitle, title, subtitle, description }) => ({
      docId: `${data.id}_${language}`,
      distinctId: data.id,
      languages: data.translations.map(({ language }) => language), // Add languages from languages field
      title: formatInlineTitle({ pretitle, title, subtitle }),
      ...(description
        ? { description: formatRichTextContentToString(description) }
        : {}),
      updatedAt: Date.parse(data.updatedAt),
      type: Collections.Collectibles,
      endpointCalled,
      data,
    })
  );

const convertFolderToDocument = ({
  data,
  endpointCalled,
}: PayloadSDKResponse<EndpointFolder>): MeiliDocument[] =>
  data.translations.map<MeiliDocument>(({ language, title, description }) => ({
    docId: `${data.id}_${language}`,
    distinctId: data.id,
    languages: [],
    title,
    ...(description
      ? { description: formatRichTextContentToString(description) }
      : {}),
    type: Collections.Folders,
    endpointCalled,
    data,
  }));

const convertAudioToDocument = ({
  data,
  endpointCalled,
}: PayloadSDKResponse<EndpointAudio>): MeiliDocument[] =>
  data.translations.map<MeiliDocument>(({ language, title, description }) => ({
    docId: `${data.id}_${language}`,
    distinctId: data.id,
    languages: data.translations.map(({ language }) => language),
    title,
    ...(description
      ? { description: formatRichTextContentToString(description) }
      : {}),
    updatedAt: Date.parse(data.updatedAt),
    type: Collections.Audios,
    endpointCalled,
    data,
  }));

const convertImageToDocument = ({
  data,
  endpointCalled,
}: PayloadSDKResponse<EndpointImage>): MeiliDocument[] => {
  if (data.translations.length > 0) {
    return data.translations.map<MeiliDocument>(
      ({ language, title, description }) => ({
        docId: `${data.id}_${language}`,
        distinctId: data.id,
        languages: [],
        title,
        ...(description
          ? { description: formatRichTextContentToString(description) }
          : {}),
        updatedAt: Date.parse(data.updatedAt),
        type: Collections.Images,
        endpointCalled,
        data,
      })
    );
  } else {
    return [
      {
        docId: data.id,
        distinctId: data.id,
        languages: [],
        title: data.filename,
        updatedAt: Date.parse(data.updatedAt),
        type: Collections.Images,
        endpointCalled,
        data,
      },
    ];
  }
};

const convertVideoToDocument = ({
  data,
  endpointCalled,
}: PayloadSDKResponse<EndpointVideo>): MeiliDocument[] =>
  data.translations.map<MeiliDocument>(({ language, title, description }) => ({
    docId: `${data.id}_${language}`,
    distinctId: data.id,
    languages: data.translations.map(({ language }) => language),
    title,
    ...(description
      ? { description: formatRichTextContentToString(description) }
      : {}),
    updatedAt: Date.parse(data.updatedAt),
    type: Collections.Videos,
    endpointCalled,
    data,
  }));

const convertRecorderToDocument = ({
  data,
  endpointCalled,
}: PayloadSDKResponse<EndpointRecorder>): MeiliDocument[] => {
  if (data.translations.length > 0) {
    return data.translations.map<MeiliDocument>(({ language, biography }) => ({
      docId: `${data.id}_${language}`,
      distinctId: data.id,
      languages: [],
      title: data.username,
      ...(biography
        ? { description: formatRichTextContentToString(biography) }
        : {}),
      type: Collections.Recorders,
      endpointCalled,
      data,
    }));
  } else {
    return [
      {
        docId: data.id,
        distinctId: data.id,
        languages: [],
        title: data.username,
        type: Collections.Recorders,
        endpointCalled,
        data,
      },
    ];
  }
};

const convertFileToDocument = ({
  data,
  endpointCalled,
}: PayloadSDKResponse<EndpointFile>): MeiliDocument[] => {
  if (data.translations.length > 0) {
    return data.translations.map<MeiliDocument>(
      ({ language, title, description }) => ({
        docId: `${data.id}_${language}`,
        distinctId: data.id,
        languages: [],
        title,
        ...(description
          ? { description: formatRichTextContentToString(description) }
          : {}),
        updatedAt: Date.parse(data.updatedAt),
        type: Collections.Files,
        endpointCalled,
        data,
      })
    );
  } else {
    return [
      {
        docId: data.id,
        distinctId: data.id,
        languages: [],
        title: data.filename,
        updatedAt: Date.parse(data.updatedAt),
        type: Collections.Files,
        endpointCalled,
        data,
      },
    ];
  }
};

const convertChronologyEventToDocument = ({
  data,
  endpointCalled,
}: PayloadSDKResponse<EndpointChronologyEvent>): MeiliDocument[] =>
  data.events.flatMap((event, index) =>
    event.translations.map<MeiliDocument>(
      ({ language, description, title, notes }) => ({
        docId: `${data.id}_${index}_${language}`,
        distinctId: `${data.id}_${index}`,
        languages: event.translations.map(({ language }) => language),
        ...(title ? { title } : {}),
        ...(description || notes
          ? {
              content: `${
                description ? formatRichTextContentToString(description) : ""
              }\n\n${notes ? formatRichTextContentToString(notes) : ""}`,
            }
          : {}),
        type: Collections.ChronologyEvents,
        endpointCalled,
        data: { date: data.date, event },
      })
    )
  );

export const convertEndpointChangeToMeiliDocuments = async (
  request: EndpointChange
): Promise<MeiliDocument[]> => {
  switch (request.type) {
    case SDKEndpointNames.getFolder:
      return convertFolderToDocument(await payload.getFolder(request.slug));

    case SDKEndpointNames.getPage:
      return convertPageToDocument(await payload.getPage(request.slug));

    case SDKEndpointNames.getCollectible:
      return convertCollectibleToDocument(
        await payload.getCollectible(request.slug)
      );

    case SDKEndpointNames.getChronologyEventByID:
      return convertChronologyEventToDocument(
        await payload.getChronologyEventByID(request.id)
      );

    case SDKEndpointNames.getImageByID:
      return convertImageToDocument(await payload.getImageByID(request.id));

    case SDKEndpointNames.getAudioByID:
      return convertAudioToDocument(await payload.getAudioByID(request.id));

    case SDKEndpointNames.getVideoByID:
      return convertVideoToDocument(await payload.getVideoByID(request.id));

    case SDKEndpointNames.getFileByID:
      return convertFileToDocument(await payload.getFileByID(request.id));

    case SDKEndpointNames.getRecorderByID:
      return convertRecorderToDocument(
        await payload.getRecorderByID(request.id)
      );

    case SDKEndpointNames.getWebsiteConfig:
    case SDKEndpointNames.getLanguages:
    case SDKEndpointNames.getCurrencies:
    case SDKEndpointNames.getWordings:
    case SDKEndpointNames.getCollectibleScans:
    case SDKEndpointNames.getCollectibleScanPage:
    case SDKEndpointNames.getCollectibleGallery:
    case SDKEndpointNames.getCollectibleGalleryImage:
    case SDKEndpointNames.getChronologyEvents:
    default:
      return [];
  }
};
