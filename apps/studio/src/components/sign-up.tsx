"use client";
import { useState } from "react";
import { signUp } from "@opstd/auth/client";
import {Button} from "@opstd/ui/components/button";
export function SignUp() {
	const [firstName, setFirstName] = useState("");
	const [lastName, setLastName] = useState("");
	const [email, setEmail] = useState("");
	const [password, setPassword] = useState("");
	const [passwordConfirmation, setPasswordConfirmation] = useState("");
	return <div><Button size="sm">Button</Button></div>;
}
