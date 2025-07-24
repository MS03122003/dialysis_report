document.addEventListener('DOMContentLoaded', () => {
    const now = new Date();
    document.getElementById('dateTime').value = now.toISOString().slice(0, 16);
    document.getElementById('storageDate').value = now.toISOString().slice(0, 10);
    const nextDue = new Date(now);
    nextDue.setDate(now.getDate() + 3);
    document.getElementById('nextDueDate').value = nextDue.toISOString().slice(0, 10);

    const stationSelect = document.getElementById('station');
    const dialyzerSelect = document.getElementById('dialyzerType');

    // function updateDefaults() {
    //   if (stationSelect.value && dialyzerSelect.value) {
    //     document.getElementById('tbv').value = (Math.random() * (90 - 85) + 85).toFixed(1) + ' mL' + ' '+ '100%';
    //     document.getElementById('pressureLeakTest').value = 'PASS';
    //   }
    // }

    stationSelect.addEventListener('change', updateDefaults);
    dialyzerSelect.addEventListener('change', updateDefaults);
  });

  function printRecord() {
    const data = {
      hospital: document.getElementById('hospital').value,
      date: document.getElementById('storageDate').value,
      time: document.getElementById('dateTime').value.split('T')[1],
      station: document.getElementById('station').value,
      mechine: document.getElementById('mechine').value,
      percentage: document.getElementById('percentage').value + ' %',
      techID: document.getElementById('techID').value,
      techname: document.getElementById('techName').value,
      patientID: document.getElementById('patientID').value,
      patientName: document.getElementById('patientName').value,
      dialyzer: document.getElementById('dialyzerType').value,
      serial: Math.floor(Math.random() * 1000000),
      uses: document.getElementById('previousUses').value,
      tbv: document.getElementById('tbv').value,
      pressure: document.getElementById('pressureLeakTest').value,
      blood: document.getElementById('bloodLeakTest').value,
      disinfect: 'PeraceticAci',
      conc: '2.0%',
      rinse: document.getElementById('finalRinse').value,
      result: document.getElementById('storageResult').value,
      reNo: document.getElementById('reprocessingNo').value,
      nextDue: document.getElementById('nextDueDate').value
    };

    const receipt = `
      Amvin Aqua Products
----------------------------------------
        Dialyzer Reprocessing Record
----------------------------------------
Hospital/Centre: ${data.hospital}
Date: ${data.date}          ${data.time}
Station: ${data.station}
Machine: ${data.mechine}
Operator ID: ${data.techID}
Operator Name: ${data.techname}
Patient ID: ${data.patientID}
Patient Name: ${data.patientName}
Dialyzer Type: ${data.dialyzer}
Serial Number: ${data.serial}
----------------------------------------
Processing Details:
Previous Uses:        ${data.uses} ✓
Fiber Bundle Volume:  ${data.tbv} ✓
TBV in %:             ${data.percentage} ✓
Pressure Leak Test:   ${data.pressure} ✓
Blood Leak Test:      ${data.blood} ✓
Final Rinse:          ${data.rinse} ✓
Storage Result:       ${data.result} ✓
Reprocessing #:       ${data.reNo}
Storage Date:         ${data.date}
Next Due:             ${data.nextDue}
`;

    const win = window.open('', '', 'width=600,height=800');
    win.document.write(
    "<html><head><title>Print Receipt</title><style>" +
      "@page { size: 80mm auto; margin: 0; }" +
      "body { font-family: 'Courier New', monospace; font-size: 12px; padding: 0; margin: 0; }" +
      "pre { white-space: pre-wrap; word-break: break-word; margin: 0; padding: 5px; }" +
    "</style></head><body><pre>" + receipt + "</pre></body></html>"
  );
  win.document.close();
  win.focus();
  win.print();
  }
function saveAsPDF() {
  const data = {
    date: document.getElementById('storageDate').value,
    time: document.getElementById('dateTime').value.split('T')[1],
    station: document.getElementById('station').value,
    hospital: document.getElementById('hospital').value,
    percentage: document.getElementById('percentage').value,
    mechine: document.getElementById('mechine').value,
    techID: document.getElementById('techID').value,
    techname: document.getElementById('techName').value,
    patientID: document.getElementById('patientID').value,
    patientName: document.getElementById('patientName').value.replace(/\s+/g, '_'),
    dialyzer: document.getElementById('dialyzerType').value,
    serial: document.getElementById('dialyzerType').value + "-" + Math.floor(Math.random() * 1000000),
    uses: document.getElementById('previousUses').value,
    tbv: document.getElementById('tbv').value,
    pressure: document.getElementById('pressureLeakTest').value,
    blood: document.getElementById('bloodLeakTest').value,
    rinse: document.getElementById('finalRinse').value,
    result: document.getElementById('storageResult').value,
    reNo: document.getElementById('reprocessingNo').value,
    nextDue: document.getElementById('nextDueDate').value
  };

  const receipt = `
      Amvin Aqua Products
----------------------------------------
        Dialyzer Reprocessing Record
----------------------------------------
Hospital/Centre: ${data.hospital}
Date: ${data.date}          ${data.time}
Station: ${data.station}
Machine: ${data.mechine}
Operator ID: ${data.techID}
Operator Name: ${data.techname}
Patient ID: ${data.patientID}
Patient Name: ${data.patientName}
Dialyzer Type: ${data.dialyzer}
Serial Number: ${data.serial}
----------------------------------------
Processing Details:
Previous Uses:        ${data.uses} ✓
Fiber Bundle Volume:  ${data.tbv} ✓
TBV in %:            ${data.percentage} ✓
Pressure Leak Test:   ${data.pressure} ✓
Blood Leak Test:      ${data.blood} ✓
Final Rinse:          ${data.rinse} ✓
Storage Result:       ${data.result} ✓
Reprocessing #:       ${data.reNo}
Storage Date:         ${data.date}
Next Due:             ${data.nextDue}
`;
  const container = document.getElementById('receiptOutput');
  container.innerText = receiptText;
  container.style.visibility = 'visible';

  const fileName = `Dialyzer_Receipt_${data.patientName}_${data.date}.pdf`;

  const opt = {
    margin: 0,
    filename: fileName,
    image: { type: 'jpeg', quality: 0.98 },
    html2canvas: { scale: 2 },
    jsPDF: { unit: 'mm', format: [80, 150], orientation: 'portrait' }
  };

  html2pdf().set(opt).from(container).save().then(() => {
    container.style.visibility = 'hidden';
  });
}
