// https://hl7.org/fhir/R4/media-example.json.html
export default function (base64ImageString: string) {
    return {
        "resourceType": "Media",
        "id": "mri-scan-example",
        "status": "completed",
        "type": {
          "coding": [
            {
              "system": "http://terminology.hl7.org/CodeSystem/media-type",
              "code": "image",
              "display": "Image"
            }
          ]
        },
        "modality": {
          "coding": [
            {
              "system": "http://terminology.hl7.org/CodeSystem/media-modality",
              "code": "diagram"
            }
          ]
        },
        "subject": {
          "reference": "Patient/xcda"
        },
        "createdDateTime": "2017-12-17",
        "issued": "2017-12-17T14:56:18Z",
        "operator": {
          "reference": "Practitioner/xcda-author"
        },
        "device": {
          "display": "Acme Camera"
        },
        "height": 145,
        "width": 126,
        "frames": 1,
        "content": {
          "id": "a1",
          "contentType": "image/gif",
          "data": base64ImageString,
          "creation": "2009-09-03"
        }
      }
}