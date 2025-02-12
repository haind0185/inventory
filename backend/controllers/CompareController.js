
import { error, success } from './common/http';
import { Service } from './common/download';
import moment from 'moment';
const XLSX = require('xlsx');

const CompareController = {
    import: async function (req, res) {
        try {
            if (!req.files || !req.files["file1"] || !req.files["file2"]) {
                throw new Error("Vui lòng upload đủ 2 file Excel");
            }
    
            const file1Path = req.files["file1"][0].path;
            const file2Path = req.files["file2"][0].path;

            const r = CompareAction.compareAndGenerateFile(file1Path, file2Path);

            if (r) {
                return res.json(
                    success({
                        path: r,
                    })
                );
            }
        } catch (err) {
            return res.json(error(err.message, 501));
        }
    },

    
};

const CompareAction = {
    readExcel: function (filePath) {
        const workbook = XLSX.readFile(filePath);
            const sheetName = workbook.SheetNames[0];
            const sheet = XLSX.utils.sheet_to_json(workbook.Sheets[sheetName], { header: 1 });
            
            let headers = ["Mã hàng", "Tên hàng", "Đơn giá", "Đơn Giá NPP"];
            let data = {};
            
            for (let i = 1; i < sheet.length; i++) {
                let row = sheet[i];
                if (row[0]) {
                    data[row[0]] = { name: row[1], price: row[2]};
                }
            }
        
            return { headers,  data };
    },

    compareAndGenerateFile: async function (oldFile, newFile) {
        const oldContent = CompareAction.readExcel(oldFile);
        const newContent = CompareAction.readExcel(newFile);
        
        let headers = oldContent.headers;
        let oldData = oldContent.data;
        let newData = newContent.data;
        
        let output = [headers];
        let styles = [];
    
        Object.keys(newData).forEach(code => {
            if (!oldData[code]) {
                // Code mới -> màu xanh lá
                output.push([code, newData[code].name, newData[code].price, newData[code].price * 1.08]);
                styles.push({ row: output.length, col: [0, 1, 2, 3], color: '00FF00' });
            } else {
                let oldRow = oldData[code];
                let newRow = newData[code];
                let row = [code, newRow.name, newRow.price, newRow.price * 1.08];
                let changedCols = [];
                
                if (oldRow.name !== newRow.name || oldRow.price !== newRow.price) {
                    changedCols = [0, 1, 2, 3];
                }
                output.push(row);
                if (changedCols.length) {
                    // Code update -> màu vàng
                    styles.push({ row: output.length, col: changedCols, color: 'FFFF00' });
                }
            }
        });
        
        const ws = XLSX.utils.aoa_to_sheet(output);
        ws['!cols'] = [
            { wch: 15 }, // Code
            { wch: 40 }, // Name
            { wch: 15 }, // Price1
            { wch: 15 }  // Price2
        ];
    
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, 'Comparison');
        
        styles.forEach(style => {
            style.col.forEach(colIdx => {
                let cellAddress = XLSX.utils.encode_cell({ r: style.row - 1, c: colIdx });
                if (!ws[cellAddress]) return;
                if (!ws[cellAddress].s) ws[cellAddress].s = {};
                ws[cellAddress].s = {
                    fill: { fgColor: { rgb: style.color } }
                };
            });
        });
    
        output.forEach((row, rowIndex) => {
            [0].forEach(colIdx => {
                if (rowIndex == 0) return;
                let cellAddress = XLSX.utils.encode_cell({ r: rowIndex, c: colIdx });
                if (!ws[cellAddress]) return;
                if (!ws[cellAddress].s) ws[cellAddress].s = {};
                ws[cellAddress].s.alignment = { horizontal: 'center', vertical: 'center' };
            });
            [2, 3].forEach(colIdx => {
                if (rowIndex == 0) return;
                let cellAddress = XLSX.utils.encode_cell({ r: rowIndex, c: colIdx });
                if (!ws[cellAddress]) return;
                if (!ws[cellAddress].s) ws[cellAddress].s = {};
                ws[cellAddress].s.alignment = { horizontal: 'right', vertical: 'center' };
            });
        });

        // add workbook to file and download
        let filename = moment().format('YYYYMMDD_HHmmss') + '_so_sanh_san_pham.xlsx';
        const r = await Service.downloadStyle(wb, filename);

        return r
    }
}

export default CompareController;
