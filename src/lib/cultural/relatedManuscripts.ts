export interface RelatedManuscriptRecord {
  id: string;
  title: string;
  institution: string;
  catalogueUrl: string;
  apiUrl: string;
  imageUrl: string;
  licenseLabel: string;
  licenseUrl: string;
  relationshipNote: string;
}

export const RELATED_MANUSCRIPTS: RelatedManuscriptRecord[] = [
  {
    id: "wellcome-cs94db4g",
    title: "Ethiopian Scroll comprising prayers against various ailments, including chest pains, the expulsion of evil spirits causing sickness and the protection of suckling infants. This illustration shows Susenyos spearing the demon, a popular motif in Ethiopean art similar to St George slaying the dragon.",
    institution: "Wellcome Collection",
    catalogueUrl: "https://wellcomecollection.org/works/cs94db4g",
    apiUrl: "https://api.wellcomecollection.org/catalogue/v2/works/cs94db4g",
    imageUrl: "https://iiif.wellcomecollection.org/image/L0031387/full/300,/0/default.jpg",
    licenseLabel: "Attribution 4.0 International (CC BY 4.0)",
    licenseUrl: "https://creativecommons.org/licenses/by/4.0/",
    relationshipNote: "Related Ethiopian scroll record only. The catalogue record does not identify a specific Telsem entry or provide a prayer transcription; it is not counted as a Telsem in this archive.",
  },
];
