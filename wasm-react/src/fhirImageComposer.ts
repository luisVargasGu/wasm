// https://hl7.org/fhir/R4/media-example.json.html
export default function (base64ImageString: string) {
    return {
        "resourceType": "Media",
        "id": "mri-scan-example",
        "status": "completed",
        "subject": {
          "reference": "Patient/xcda"
        },
        "content": {
          "id": "a1",
          "contentType": "image/jpeg",
          "data": base64ImageString,
          "creation": "2009-09-03"
        }
      }
}