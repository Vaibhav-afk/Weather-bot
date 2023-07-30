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
}

export const UserSchema = SchemaFactory.createForClass(User);
