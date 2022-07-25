import { Input as CustomInput, IInputProps } from "native-base";

export function Input(props: IInputProps) {
  return (
    <CustomInput
      bg="gray.700"
      h={14}
      size="md"
      borderWidth={0}
      fontSize="md"
      fontFamily="body"
      color="white"
      placeholderTextColor="gray.300"
      _focus={{
        borderWidth: 1,
        borderColor: "green.500",
        bg: "gray.700",
      }}
      {...props}
    />
  );
}