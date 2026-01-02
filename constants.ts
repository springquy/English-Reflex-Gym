
import { Question, Category } from './types';

export const FILLER_WORDS = ["um", "uh", "ah", "well", "so", "like", "actually", "basically", "literally", "hmm"];

export const CONTRACTIONS: Record<string, string> = {
  "what's": "what is", "where's": "where is", "it's": "it is", "i'm": "i am",
  "you're": "you are", "he's": "he is", "she's": "she is", "we're": "we are",
  "they're": "they are", "isn't": "is not", "aren't": "are not", "don't": "do not",
  "doesn't": "does not", "didn't": "did not", "can't": "cannot", "couldn't": "could not",
  "won't": "will not", "wouldn't": "would not", "haven't": "have not", "hasn't": "has not",
  "gonna": "going to", "wanna": "want to", "gotta": "got to", "lemme": "let me", "'cause": "because"
};

export const MOCK_DATA: Question[] = [
  // Giao tiếp
  { id: 1, category: "Giao tiếp", level: "Easy", vietnamese: "Bạn tên là gì?", main_answer: "What is your name?", variations: ["What's your name", "Can I have your name"], hint: { structure: "Wh-word + to be + Possessive Adj + N?", vocab: "What, Name" }, note: "Dùng 'May I...' sẽ lịch sự hơn." },
  { id: 2, category: "Giao tiếp", level: "Easy", vietnamese: "Rất vui được gặp bạn.", main_answer: "Nice to meet you.", variations: ["Pleased to meet you", "It is a pleasure to meet you"], hint: { structure: "Adj + to + V + O", vocab: "Nice, Meet" }, note: "Câu trả lời phổ biến là 'Nice to meet you too'." },
  { id: 11, category: "Giao tiếp", level: "Medium", vietnamese: "Bạn có thể nói chậm lại một chút không?", main_answer: "Could you speak a bit slower, please?", variations: ["Can you talk slower", "Would you mind speaking more slowly"], hint: { structure: "Could you + V + adv?", vocab: "Slower, Speak" }, note: "Thêm 'please' để lịch sự hơn." },
  { id: 12, category: "Giao tiếp", level: "Easy", vietnamese: "Chúc một ngày tốt lành!", main_answer: "Have a nice day!", variations: ["Have a good day", "Have a great one"], hint: { structure: "Have + a + Adj + N", vocab: "Nice, Day" }, note: "Lời chào tạm biệt phổ biến." },
  
  // Công việc
  { id: 3, category: "Công việc", level: "Medium", vietnamese: "Bạn làm nghề gì?", main_answer: "What do you do?", variations: ["What's your job", "What is your profession"], hint: { structure: "What + do + S + do?", vocab: "Do (làm)" }, note: "'What do you do?' tự nhiên hơn 'What is your job?'." },
  { id: 13, category: "Công việc", level: "Hard", vietnamese: "Tôi phụ trách bộ phận bán hàng.", main_answer: "I am in charge of the sales department.", variations: ["I manage the sales department", "I'm responsible for sales"], hint: { structure: "S + be + in charge of + N", vocab: "In charge of, Sales" }, note: "'In charge of' nghĩa là chịu trách nhiệm/phụ trách." },
  { id: 14, category: "Công việc", level: "Medium", vietnamese: "Cuộc họp bắt đầu lúc mấy giờ?", main_answer: "What time does the meeting start?", variations: ["When is the meeting starting", "At what time is the meeting"], hint: { structure: "What time + does + S + V?", vocab: "Meeting, Start" }, note: "Có thể dùng 'When' thay cho 'What time'." },
  { id: 15, category: "Công việc", level: "Hard", vietnamese: "Tôi muốn ứng tuyển vào vị trí này.", main_answer: "I would like to apply for this position.", variations: ["I want to apply for this job", "I'm applying for this role"], hint: { structure: "S + would like to + V + for + N", vocab: "Apply, Position" }, note: "'Apply for' là cụm từ cố định." },

  // Cảm xúc
  { id: 4, category: "Cảm xúc", level: "Medium", vietnamese: "Tôi không đồng ý với bạn.", main_answer: "I do not agree with you.", variations: ["I don't agree", "I disagree with you"], hint: { structure: "S + do not + V + with + O", vocab: "Agree, Disagree" }, note: "Dùng 'I'm afraid I don't agree' để lịch sự hơn." },
  { id: 16, category: "Cảm xúc", level: "Easy", vietnamese: "Tôi đang cảm thấy rất mệt.", main_answer: "I am feeling very tired.", variations: ["I feel exhausted", "I'm so tired"], hint: { structure: "S + be + feeling + Adj", vocab: "Tired, Feeling" }, note: "'Exhausted' dùng khi cực kỳ mệt mỏi." },
  { id: 17, category: "Cảm xúc", level: "Medium", vietnamese: "Đừng lo lắng về điều đó.", main_answer: "Don't worry about that.", variations: ["No need to worry", "Forget about it"], hint: { structure: "Don't + V + about + N", vocab: "Worry" }, note: "Cấu trúc khuyên nhủ phổ biến." },
  { id: 18, category: "Cảm xúc", level: "Hard", vietnamese: "Tôi rất trân trọng sự giúp đỡ của bạn.", main_answer: "I really appreciate your help.", variations: ["I'm so grateful for your help", "Thank you so much for helping me"], hint: { structure: "S + appreciate + O", vocab: "Appreciate, Help" }, note: "'Appreciate' là một từ rất hay để cảm ơn." },

  // Du lịch
  { id: 5, category: "Du lịch", level: "Easy", vietnamese: "Nhà vệ sinh ở đâu?", main_answer: "Where is the restroom?", variations: ["Where's the toilet", "Where is the bathroom"], hint: { structure: "Where + is + the + Place?", vocab: "Restroom, Toilet" }, note: "Mỹ dùng 'Restroom', Anh dùng 'Toilet'." },
  { id: 8, category: "Du lịch", level: "Medium", vietnamese: "Chuyến bay tiếp theo đến London khi nào khởi hành?", main_answer: "When does the next flight to London depart?", variations: ["When is the next flight to London leaving"], hint: { structure: "When + does + S + V?", vocab: "Depart, Flight" }, note: "'Depart' trang trọng hơn 'Leave'." },
  { id: 19, category: "Du lịch", level: "Medium", vietnamese: "Tôi có thể mua vé ở đâu?", main_answer: "Where can I buy a ticket?", variations: ["Where do I get a ticket", "Where is the ticket office"], hint: { structure: "Where + can + I + V + O?", vocab: "Ticket, Buy" }, note: "Dùng 'Where is the ticket counter?' cũng được." },
  { id: 20, category: "Du lịch", level: "Hard", vietnamese: "Làm ơn cho tôi biết đường đến ga tàu điện ngầm.", main_answer: "Please tell me the way to the subway station.", variations: ["How do I get to the subway station", "Where is the nearest subway"], hint: { structure: "Tell + O + the way + to + N", vocab: "Subway, Station" }, note: "Anh-Anh dùng 'Underground' hoặc 'Tube' thay cho 'Subway'." },

  // Nhà hàng
  { id: 6, category: "Nhà hàng", level: "Easy", vietnamese: "Tôi có thể xem thực đơn được không?", main_answer: "Can I see the menu?", variations: ["May I see the menu", "Could I have the menu please"], hint: { structure: "Can/May + I + V + O?", vocab: "See, Menu" }, note: "Thêm 'please' luôn tốt." },
  { id: 9, category: "Nhà hàng", level: "Medium", vietnamese: "Tôi muốn đặt bàn cho hai người lúc 7 giờ tối.", main_answer: "I would like to book a table for two at 7 PM.", variations: ["Can I reserve a table for two"], hint: { structure: "S + would like to + book + O", vocab: "Book, Table" }, note: "'Book' và 'Reserve' có nghĩa tương đương." },
  { id: 21, category: "Nhà hàng", level: "Medium", vietnamese: "Tính tiền cho tôi nhé.", main_answer: "Check, please.", variations: ["Could I have the bill, please", "Can I pay now"], hint: { structure: "Phrase + please", vocab: "Check, Bill" }, note: "Mỹ dùng 'Check', Anh dùng 'Bill'." },
  { id: 22, category: "Nhà hàng", level: "Hard", vietnamese: "Món này có quá cay không?", main_answer: "Is this dish too spicy?", variations: ["How spicy is this", "Is it very hot"], hint: { structure: "Is + S + too + Adj?", vocab: "Spicy, Dish" }, note: "'Hot' cũng có nghĩa là cay." },

  // Hàng ngày
  { id: 7, category: "Hàng ngày", level: "Easy", vietnamese: "Bây giờ là mấy giờ?", main_answer: "What time is it?", variations: ["What is the time", "Do you have the time"], hint: { structure: "What + time + is + it?", vocab: "Time" }, note: "'Do you have the time?' nghĩa là hỏi giờ." },
  { id: 23, category: "Hàng ngày", level: "Easy", vietnamese: "Hôm nay thời tiết thế nào?", main_answer: "How is the weather today?", variations: ["What's the weather like today", "Is it nice outside"], hint: { structure: "How + is + the + N?", vocab: "Weather" }, note: "Chủ đề bắt chuyện phổ biến." },
  { id: 24, category: "Hàng ngày", level: "Medium", vietnamese: "Tôi phải đi siêu thị mua một ít đồ ăn.", main_answer: "I have to go to the supermarket to buy some food.", variations: ["I need to go grocery shopping"], hint: { structure: "S + have to + V + to + V", vocab: "Supermarket, Food" }, note: "'Grocery shopping' là đi mua thực phẩm hàng ngày." },
  { id: 25, category: "Hàng ngày", level: "Medium", vietnamese: "Bạn thường làm gì vào cuối tuần?", main_answer: "What do you usually do at the weekend?", variations: ["What are your weekend plans", "What do you do for fun on weekends"], hint: { structure: "What + do + S + usually + do?", vocab: "Weekend, Usually" }, note: "Anh-Anh dùng 'at the weekend', Anh-Mỹ dùng 'on the weekend'." }
];

export const CATEGORIES: Category[] = ['All', 'Giao tiếp', 'Công việc', 'Cảm xúc', 'Du lịch', 'Nhà hàng', 'Hàng ngày'];
