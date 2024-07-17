// src/components/JsonViewer.js
import React from 'react';
import ReactJson from 'react-json-view';

const JsonViewer = ({ jsonData }) => {
  return (
    <div>
      <h3>FHIR Resource</h3>
      <ReactJson src={jsonData} theme={'harmonic'} displayObjectSize={false} collapsed={false} />
    </div>
  );
};

export default JsonViewer;
