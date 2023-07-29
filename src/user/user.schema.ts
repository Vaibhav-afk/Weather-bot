import { Schema, Prop, SchemaFactory } from '@nestjs/mongoose';

@Schema({
  timestamps: true,
})
export class User {
  @Prop({ required: true })
  username: string;

  @Prop({ required: true, unique: true })
  phone: number;
}

export const UserSchema = SchemaFactory.createForClass(User);
