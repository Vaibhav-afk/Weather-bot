import { Schema, Prop, SchemaFactory } from '@nestjs/mongoose';

@Schema({
  timestamps: true,
})
export class User {
  @Prop({ required: true })
  username: string;

  @Prop({ required: true, unique: true })
  chatId: number;

  @Prop({ required: true, default: false })
  isSubscribed: boolean;

  @Prop({ required: false, default: false })
  isAdmin: boolean;

  @Prop({
    required: true,
    type: [Number], // An array of two numbers [latitude, longitude]
    default: [0, 0], // Default location [0, 0]
  })
  location: [number, number];
}

export const UserSchema = SchemaFactory.createForClass(User);
