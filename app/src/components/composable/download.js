export function downloadCSV(data) {
  if (data) {
    const newData = data.map((scan) => scan.properties)
    const csvContent = dicoToFormatCSV(newData)
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8' })
    const objUrl = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.setAttribute('href', objUrl)
    link.setAttribute('download', 'scans.csv')
    link.click()
  }
}

function dicoToFormatCSV(arrObj) {
  const titleKeys = Object.keys(arrObj[0])

  const refinedData = []
  refinedData.push(titleKeys)

  arrObj.forEach((item) => {
    refinedData.push(Object.values(item))
  })

  let csvContent = ''

  refinedData.forEach((row) => {
    const formattedRow = row.map((field) => {
      if (String(field).includes(',')) {
        return `"${field.replace(/"/g, '""')}"`
      }
      return field
    })
    csvContent += formattedRow.join(';') + '\n'
  })

  return csvContent.trim()
}
