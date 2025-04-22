// public/dataWorker.js
// ไฟล์นี้ต้องอยู่ใน public folder
self.onmessage = async function(e) {
    const { action, url, pageSize, startIndex } = e.data;
    
    if (action === 'fetchData') {
      try {
        const response = await fetch(`${url}&limit=${pageSize}&offset=${startIndex}`);
        
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const data = await response.json();
        self.postMessage({ 
          action: 'dataChunk', 
          data: data.features, 
          total: data.numberMatched,
          returned: data.numberReturned,
          startIndex: startIndex
        });
      } catch (error) {
        self.postMessage({ action: 'error', error: error.message });
      }
    }
  };