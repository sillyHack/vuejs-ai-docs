"use client";

import { Button } from "@/src/components/ui/button";
import { useChat } from "ai/react";
import {
	Card,
	CardContent,
	CardHeader,
	CardTitle,
} from "@/src/components/ui/card";
import Image from "next/image";
import { Textarea } from "@/src/components/ui/textarea";
import {
	ArrowDown,
	RefreshCcw,
	RefreshCcwDot,
	Send,
	StopCircle,
} from "lucide-react";
import Markdown from "react-markdown";
import { useEffect, useRef, useState } from "react";
import { cn } from "@/src/lib/utils";
import { toast } from "sonner";

const ChatApp = () => {
	const [showSources, setShowSources] = useState(false);
	const {
		messages,
		input,
		handleInputChange,
		handleSubmit,
		stop,
		isLoading,
		data,
		reload,
		setMessages,
	} = useChat({
		onFinish: () => {
			setShowSources(true);
		},
		onResponse: () => {
			setShowSources(false);
		},
		onError: () => {
			toast.error("Too many requests. Maximum 5 per hour.");
		},
	});

	const resetMessages = () => {
		setMessages([]);
		stop();
	};

	const [autoScroll, setAutoScroll] = useState(true);
	const chatContainerRef = useRef<HTMLDivElement>(null);

	const isEmptyMessages = messages.length === 0;

	useEffect(() => {
		const chatContainer = chatContainerRef.current;
		if (!chatContainer) return;
		if (!autoScroll) return;

		const { scrollHeight, clientHeight } = chatContainer;

		chatContainer.scrollTop = scrollHeight - clientHeight;
	}, [autoScroll, messages]);

	useEffect(() => {
		// add event listener to scroll of chatContainerRef if defined
		const chatContainer = chatContainerRef.current;

		if (!chatContainer) return;

		const handleScroll = () => {
			const { scrollHeight, clientHeight, scrollTop } = chatContainer;

			if (scrollHeight - clientHeight - scrollTop <= 1) {
				setAutoScroll(true);
			} else {
				setAutoScroll(false);
			}
		};

		chatContainer.addEventListener("scroll", handleScroll);

		return () => {
			chatContainer.removeEventListener("scroll", handleScroll);
		};
	}, [messages.length]);

	const exampleQuestions = [
		"Tell me about lazy loading in a short way",
		"How to handle Vue component lifecycle?",
		"Explain Vue reactivity system briefly",
		"What are Vue directives?",
		"How to use Vue Router?"
	];

	return (
		<div
			className={"flex h-screen max-h-screen w-full flex-col items-center justify-center gap-3"}
		>
			<h1
				className={cn("text-xl font-bold flex gap-3 items-center", {
					"text-2xl": isEmptyMessages,
				})}
			>
				<Image
					src="/assets/vuejs.svg"
					alt="VueJS Logo"
					width={40}
					height={40}
				/>
				Talk with VueJS Doc
			</h1>
			<p>
				You can ask any question relative to the Vue.js official website
				documentation
			</p>
			{!isEmptyMessages ? (
				<div
					className="m-auto flex max-w-2xl flex-1 flex-col items-stretch gap-3 overflow-auto scroll-smooth py-7"
					ref={chatContainerRef}
				>
					{messages.map((m, idx) => (
						<Card key={m.id} className="whitespace-pre-wrap">
							<CardHeader>
								<CardTitle className="flex items-center gap-3">
									{m.role === "user" ? (
										<p className="flex size-9 items-center justify-center rounded-full bg-gray-300">
											U
										</p>
									) : (
										<Image
											src="/assets/vuejs.svg"
											alt="VueJS Logo"
											width={40}
											height={40}
										/>
									)}
									{m.role === "user" ? "User" : "VueGPT"}
								</CardTitle>
							</CardHeader>
							<CardContent className="flex flex-col gap-3">
								<Markdown className="prose">{m.content}</Markdown>
								{showSources && !m.content.includes("I'm sorry") && idx === messages.length - 1 && data && (
									<div className="mt-10">
										<p className="font-bold">Sources:</p>
										{m.role !== "user"
											? 
												<div className="flex flex-col gap-2 text-sm">
													{(data[data.length - 1] as { sources: string[] }).sources.map((source) => (
														<a key={source} href={source} target="_blank" className="italic underline">
															{source}
														</a>
													))}
												</div>
											: ""}
									</div>
								)}
							</CardContent>
						</Card>
					))}
				</div>
			) : null}
			<form onSubmit={handleSubmit} className="flex w-full justify-center">
				<div className="w-full max-w-xl p-3">
					{messages.length >= 1 ? (
						<div className="mb-1 flex justify-start gap-3">
							<Button
								variant={"ghost"}
								onClick={resetMessages}
								disabled={isLoading}
							>
								<RefreshCcwDot size={16} className="mr-2" />
								Reset
							</Button>
							<Button onClick={() => reload()} disabled={isLoading}>
								<RefreshCcw size={16} className="mr-2" />
								Reload
							</Button>
							{!autoScroll ? (
								<Button
									variant="outline"
									size="sm"
									onClick={() => {
										setAutoScroll(true);
									}}
								>
									<ArrowDown size={16} className="mr-2" />
									Scroll
								</Button>
							) : null}
						</div>
					) : null}
					<div className="flex w-full flex-col items-end gap-3">
						{messages.length === 0 && <div className="mb-2 flex flex-wrap gap-2">
							{exampleQuestions.map((question, index) => (
								<button
									key={index}
									onClick={(e) => {
										e.preventDefault();
										handleInputChange({ target: { value: question }} as React.ChangeEvent<HTMLTextAreaElement>);
									}}
									className="rounded-full bg-gray-100 px-3 py-1 text-sm transition-colors hover:bg-gray-200"
								>
									{question}
								</button>
							))}
						</div>}
						<div className="flex w-full items-end gap-3">
							<Textarea
								className="rounded border border-gray-300 shadow-xl"
								value={input}
								rows={4}
								cols={20}
								placeholder="What do you want to ask ?"
								onChange={handleInputChange}
							/>
							{isLoading ? (
								<Button onClick={stop} className="bg-red-500">
									<StopCircle />
								</Button>
							) : (
								<Button className="p-3">
									<Send size={16} />
								</Button>
							)}
						</div>
					</div>
				</div>
			</form>
		</div>
	);
};

export default ChatApp;
