import JSZip from 'jszip';

type ProblemState = any; 

export async function buildProblemZip(
  problemState: ProblemState,
  originalZipFile?: File | null,
): Promise<Blob> {
    console.log('Datos recibidos por el builder:', JSON.stringify(problemState, null, 2));

    const newZip = new JSZip();
    let originalZip: JSZip | null = null;
    // 1. Cargamos el ZIP original para poder leerlo
    if (originalZipFile) {
        originalZip = await JSZip.loadAsync(originalZipFile);
    }

    // 2. Añadimos statements y solutions (antes eran los métodos getSolution/getStatement)
    newZip.folder('statements')?.file('es.markdown', problemState.problemMarkdown);
    newZip.folder('solutions')?.file('es.markdown', problemState.problemSolutionMarkdown);
    
    // 3. Procesamos los casos y el testplan
    const casesFolder = newZip.folder('cases');
    let testPlanData: string = '';
    const caseProcessingPromises: Promise<void>[] = [];

    // Usamos los grupos del estado que pasamos como parámetro
    problemState.casesStore.groups.forEach((_group: any) => {
    _group.cases.forEach((_case: any) => {
        let fileName = _case.name;
        if (_group.ungroupedCase === false) {
            fileName = `${_group.name}.${fileName}`;
        }
        testPlanData += `${fileName} ${_case.points}\n`;

        // --- Procesar .in ---
        const inPromise = (async () => {
            let inputContent = '';
            if (_case.lines && _case.lines.length > 0) {
                inputContent = _case.lines[0].data.value;
            }
            const pathInZip = `${fileName}.in`;

            if (inputContent?.endsWith('...[TRUNCATED]') && originalZip) {
                const originalFile = originalZip.file(`cases/${pathInZip}`);
                if (originalFile) {
                const originalContent = await originalFile.async('blob');
                casesFolder?.file(pathInZip, originalContent);
                }
            } else {
                casesFolder?.file(pathInZip, inputContent);
            }
        })();
        caseProcessingPromises.push(inPromise);

        // --- Procesar .out ---
        const outPromise = (async () => {
        const pathInZip = `${fileName}.out`;
        const outputContent = _case.output;

        if (outputContent?.endsWith('...[TRUNCATED]') && originalZip) {
            const originalFile = originalZip.file(`cases/${pathInZip}`);
            if (originalFile) {
            const originalContent = await originalFile.async('blob');
            casesFolder?.file(pathInZip, originalContent);
            }
        } else {
            casesFolder?.file(pathInZip, outputContent);
        }
        })();
        caseProcessingPromises.push(outPromise);
    });
    });

    // Esperamos a que todos los casos se procesen
    await Promise.all(caseProcessingPromises);

    // 4. Añadimos los archivos finales
    newZip.file('testplan', testPlanData);
    newZip.file('cdp.data', JSON.stringify(problemState)); // Guardamos el estado completo

    // 5. Generamos y devolvemos el Blob final
    return newZip.generateAsync({
    type: 'blob',
    compression: 'DEFLATE',
    compressionOptions: { level: 1},
    });
}