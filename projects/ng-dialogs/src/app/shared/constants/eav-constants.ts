export type EavMetadataKey = 'attribute' | 'app' | 'entity' | 'contentType' | 'zone' | 'cmsObject';
export type EavKeyTypeKey = 'guid' | 'string' | 'number';
export type EavScopesKey = 'default' | 'app' | 'cmsSystem' | 'system';
export interface EavScopeOption { name: string; value: string; }

export const eavConstants = {
  metadata: {
    /** metadataOfAttribute */
    attribute: { type: 2, target: 'EAV Field Properties' },
    /** metadataOfApp */
    app: { type: 3, target: 'App' },
    /** metadataOfEntity */
    entity: { type: 4, target: 'Entity' },
    /** metadataOfContentType */
    contentType: { type: 5, target: 'ContentType' },
    /** metadataOfZone */
    zone: { type: 6, target: 'Zone' },
    /** metadataOfCmsObject */
    cmsObject: { type: 10, target: 'CmsObject' },
  },

  /** Loopup type for the metadata, e.g. key=80adb152-efad-4aa4-855e-74c5ef230e1f is keyType=guid */
  keyTypes: {
    guid: 'guid',
    string: 'string',
    number: 'number',
  },

  /** Scopes */
  scopes: {
    /** This is the main schema and the data you usually see is from here */
    default: { name: 'Default', value: '2SexyContent' },
    /** This contains content-types for configuration, settings and resources of the app */
    app: { name: 'App', value: '2SexyContent-App' },
    /** This contains view-definitions, content-types etc. */
    cmsSystem: { name: 'CMS System', value: '2SexyContent-System' },
    /** This contains core EAV data like input-field configurations and similar */
    system: { name: 'System', value: 'System' },
  },

  /** Content types where templates, permissions, etc. are stored */
  contentTypes: {
    /** Content type containing app templates (views) */
    template: '2SexyContent-Template',
    /** Content type containing permissions */
    permissions: 'PermissionConfiguration',
    /** Content type containing queries */
    query: 'DataPipeline',
    /** Content type containing content type metadata (app administration > data > metadata) */
    contentType: 'ContentType',
    /** Content type containing app settings */
    settings: 'App-Settings',
    /** Content type containing app resources */
    resources: 'App-Resources',
  },

  pipelineDesigner: {
    outDataSource: {
      className: 'SexyContentTemplate',
      in: ['Content', 'Presentation', 'ListContent', 'ListPresentation'],
      name: '2SexyContent Module',
      description: 'The module/template which will show this data',
      visualDesignerData: { Top: 40, Left: 400 }
    },
    defaultPipeline: {
      dataSources: [
        {
          entityGuid: 'unsaved1',
          partAssemblyAndType: 'ToSic.Eav.DataSources.App, ToSic.Eav.DataSources',
          visualDesignerData: { Top: 300, Left: 440, Width: 400 }
        }
      ],
      streamWiring: [
        { From: 'unsaved1', Out: 'Default', To: 'Out', In: 'Content' },
        { From: 'unsaved1', Out: 'Default', To: 'Out', In: 'ListContent' },
        { From: 'unsaved1', Out: 'Default', To: 'Out', In: 'Presentation' },
        { From: 'unsaved1', Out: 'Default', To: 'Out', In: 'ListPresentation' }
      ]
    },
    testParameters: '[Demo:Demo]=true',
  },
};
