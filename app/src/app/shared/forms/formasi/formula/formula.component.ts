import { Component, ChangeDetectionStrategy } from '@angular/core';
import { FieldArrayType } from '@ngx-formly/core';
import { FormasiService } from 'app/services/formasi.service';
import { ToastrService } from 'ngx-toastr';


@Component({
  selector: 'app-form-formasi-formula',
  templateUrl: './formula.component.html',
  styleUrls: ['./formula.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class FormasiFormulaComponent extends FieldArrayType {
    constructor(
        private _formasiService: FormasiService,
        private _toastr: ToastrService,
    ) {
        super();
    }
    calculate(): void{
        const body = new FormData();
        const formula = [];
        this.model.forEach((f) => {
            formula.push({uraianTugasId: f.uraianTugasId.id, output: +f.output});
        });
        console.log(formula);
        body.append('formula', JSON.stringify(formula));
        this._formasiService.calculate(body).subscribe(
            (result) => {
                console.log(result);
                if (result?.success) {
                    this._toastr.success(result.mapData.hasilPerhitungan.sumOfWorkerNeeds + ' Orang', 'Jumlah formasi yang dibutuhkan');
                    this.form.reset();
                } else {
                    this._toastr.error(result?.message, 'ERROR');
                }
            }
        );
        return;
    }
}


