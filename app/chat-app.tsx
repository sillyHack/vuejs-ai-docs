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
			toast.error("Too many requests. Maximum 3 every 10 minutes.");
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

	return (
		<div
			className={cn("max-h-screen w-full flex flex-col gap-3 items-center", {
				"h-screen": isEmptyMessages,
				"justify-center": isEmptyMessages,
			})}
		>
			<h1
				className={cn("text-xl font-bold flex gap-3 items-center mt-auto", {
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
			<p className="mb-auto">
				You can ask any question relative to the Vue.js official website
				documentation
			</p>
			{!isEmptyMessages ? (
				<div
					className="mx-auto flex max-w-2xl flex-1 flex-col items-stretch gap-3 overflow-auto scroll-smooth py-7"
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
								{showSources && idx === messages.length - 1 && data && (
									<Markdown className="prose mt-10 text-sm">
										{m.role !== "user"
											? (data[data.length - 1] as { sources: string }).sources
											: ""}
									</Markdown>
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
					<div className="flex w-full items-end gap-3">
						<Textarea
							className="rounded border border-gray-300 shadow-xl"
							value={input}
							rows={4}
							cols={20}
							placeholder="Tell me about lazy loading..."
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
			</form>
		</div>
	);
};

export default ChatApp;
