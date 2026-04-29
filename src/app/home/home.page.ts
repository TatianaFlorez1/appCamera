import { Component, OnInit } from '@angular/core';
import { Camera, CameraResultType, CameraSource } from '@capacitor/camera';
import { PhotoDbService } from "./photo-db.service";
import { PhotoItem } from "./IPhotoItem";
import { AlertController } from '@ionic/angular';

@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
  standalone: false,
})
export class HomePage implements OnInit {

  photos: PhotoItem[] = [];

  constructor(
    private _PhotoDbService: PhotoDbService,
    private alertCtrl: AlertController
  ) {}

  async ngOnInit(): Promise<void> {
    await this._PhotoDbService.init();
    await this.loadPhotos();
  }

  async takePicture(): Promise<void> {
    try {
      const result = await Camera.getPhoto({
        quality: 90,
        allowEditing: false,
        resultType: CameraResultType.Base64, // ← CAMBIO: pedimos base64 directo
        source: CameraSource.Camera          // ← abre la cámara del celular
      });

      if (!result.base64String) return;

      // Armamos el string completo para mostrarlo en <img>
      const base64Image = `data:image/jpeg;base64,${result.base64String}`;

      await this._PhotoDbService.savePhoto({
        imagePath: base64Image,  // ← guardamos el base64 completo
        caption: 'Sin descripción',
        photoDate: new Date().toLocaleDateString(),
        isFavorite: false
      });

      await this.loadPhotos();

    } catch (error) {
      console.error('Error al tomar la foto:', error);
    }
  }

  async loadPhotos(): Promise<void> {
    this.photos = await this._PhotoDbService.getPhotos();
  }

  async deletePhoto(photo: PhotoItem): Promise<void> {
    const alert = await this.alertCtrl.create({
      header: 'Eliminar foto',
      message: '¿Estás seguro que deseas eliminar esta foto?',
      buttons: [
        { text: 'Cancelar', role: 'cancel' },
        {
          text: 'Eliminar',
          handler: async () => {
            await this._PhotoDbService.deletePhoto(photo.id!);
            await this.loadPhotos();
          }
        }
      ]
    });
    await alert.present();
  }

  async editCaption(photo: PhotoItem): Promise<void> {
    const alert = await this.alertCtrl.create({
      header: 'Editar descripción',
      inputs: [
        {
          name: 'caption',
          type: 'text',
          value: photo.caption,
          placeholder: 'Escribe una descripción'
        }
      ],
      buttons: [
        { text: 'Cancelar', role: 'cancel' },
        {
          text: 'Guardar',
          handler: async (data) => {
            if (data.caption.trim() === '') return;
            await this._PhotoDbService.updateCaption(photo.id!, data.caption.trim());
            await this.loadPhotos();
          }
        }
      ]
    });
    await alert.present();
  }

  async toggleFavorite(photo: PhotoItem): Promise<void> {
    await this._PhotoDbService.updateFavorite(photo.id!, !photo.isFavorite);
    await this.loadPhotos();
  }
}