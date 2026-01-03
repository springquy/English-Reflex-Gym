
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
  // --- Giao tiếp (10 câu) ---
  { id: 1, category: "Giao tiếp", level: "Easy", vietnamese: "Bạn tên là gì?", main_answer: "What is your name?", variations: ["What's your name", "Can I have your name"], hint: { structure: "Wh-word + to be + Possessive Adj + N?", vocab: "What, Name" }, note: "Dùng 'May I...' sẽ lịch sự hơn." },
  { id: 2, category: "Giao tiếp", level: "Easy", vietnamese: "Rất vui được gặp bạn.", main_answer: "Nice to meet you.", variations: ["Pleased to meet you", "It is a pleasure to meet you"], hint: { structure: "Adj + to + V + O", vocab: "Nice, Meet" }, note: "Câu trả lời phổ biến là 'Nice to meet you too'." },
  { id: 11, category: "Giao tiếp", level: "Medium", vietnamese: "Bạn có thể nói chậm lại một chút không?", main_answer: "Could you speak a bit slower, please?", variations: ["Can you talk slower", "Would you mind speaking more slowly"], hint: { structure: "Could you + V + adv?", vocab: "Slower, Speak" }, note: "Thêm 'please' để lịch sự hơn." },
  { id: 12, category: "Giao tiếp", level: "Easy", vietnamese: "Chúc một ngày tốt lành!", main_answer: "Have a nice day!", variations: ["Have a good day", "Have a great one"], hint: { structure: "Have + a + Adj + N", vocab: "Nice, Day" }, note: "Lời chào tạm biệt phổ biến." },
  { id: 101, category: "Giao tiếp", level: "Easy", vietnamese: "Bạn đến từ đâu?", main_answer: "Where are you from?", variations: ["Where do you come from"], hint: { structure: "Where + be + S + from?", vocab: "From" }, note: "" },
  { id: 102, category: "Giao tiếp", level: "Easy", vietnamese: "Mọi việc thế nào?", main_answer: "How is it going?", variations: ["How are you doing", "How are things"], hint: { structure: "How + be + S + V-ing?", vocab: "Going" }, note: "Câu hỏi thăm xã giao phổ biến." },
  { id: 103, category: "Giao tiếp", level: "Medium", vietnamese: "Lâu rồi không gặp.", main_answer: "Long time no see.", variations: ["It has been a long time", "I haven't seen you in ages"], hint: { structure: "Phrase", vocab: "Long time" }, note: "Dùng khi gặp lại người quen cũ." },
  { id: 104, category: "Giao tiếp", level: "Medium", vietnamese: "Bạn nhắc lại được không?", main_answer: "Can you say that again?", variations: ["Can you repeat that", "Say that again please"], hint: { structure: "Can you + V + that + again?", vocab: "Say, Again" }, note: "" },
  { id: 105, category: "Giao tiếp", level: "Easy", vietnamese: "Xin lỗi / Làm phiền một chút.", main_answer: "Excuse me.", variations: ["Pardon me"], hint: { structure: "Phrase", vocab: "Excuse" }, note: "Dùng trước khi hỏi hoặc khi muốn đi qua." },
  { id: 106, category: "Giao tiếp", level: "Medium", vietnamese: "Hãy giữ liên lạc nhé.", main_answer: "Let's keep in touch.", variations: ["Stay in touch", "Don't be a stranger"], hint: { structure: "Let's + V + ...", vocab: "Touch, Keep" }, note: "" },

  // --- Công việc (10 câu) ---
  { id: 3, category: "Công việc", level: "Medium", vietnamese: "Bạn làm nghề gì?", main_answer: "What do you do?", variations: ["What's your job", "What is your profession"], hint: { structure: "What + do + S + do?", vocab: "Do (làm)" }, note: "'What do you do?' tự nhiên hơn 'What is your job?'." },
  { id: 13, category: "Công việc", level: "Hard", vietnamese: "Tôi phụ trách bộ phận bán hàng.", main_answer: "I am in charge of the sales department.", variations: ["I manage the sales department", "I'm responsible for sales"], hint: { structure: "S + be + in charge of + N", vocab: "In charge of, Sales" }, note: "'In charge of' nghĩa là chịu trách nhiệm/phụ trách." },
  { id: 30, category: "Công việc", level: "Hard", vietnamese: "Tôi phụ trách dự án marketing.", main_answer: "I am in charge of the marketing project.", variations: ["I manage the marketing project", "I lead the marketing team"], hint: { structure: "S + be + in charge of + N", vocab: "Marketing, Project" }, note: "" },
  { id: 14, category: "Công việc", level: "Medium", vietnamese: "Cuộc họp bắt đầu lúc mấy giờ?", main_answer: "What time does the meeting start?", variations: ["When is the meeting starting", "At what time is the meeting"], hint: { structure: "What time + does + S + V?", vocab: "Meeting, Start" }, note: "" },
  { id: 15, category: "Công việc", level: "Hard", vietnamese: "Tôi muốn ứng tuyển vào vị trí này.", main_answer: "I would like to apply for this position.", variations: ["I want to apply for this job", "I'm applying for this role"], hint: { structure: "S + would like to + V + for + N", vocab: "Apply, Position" }, note: "'Apply for' là cụm từ cố định." },
  { id: 201, category: "Công việc", level: "Medium", vietnamese: "Tôi có thể xin nghỉ ngày mai không?", main_answer: "Can I take a day off tomorrow?", variations: ["May I have a day off tomorrow", "Is it okay if I take tomorrow off"], hint: { structure: "Can I + V + N?", vocab: "Day off" }, note: "'Day off' là ngày nghỉ phép." },
  { id: 202, category: "Công việc", level: "Medium", vietnamese: "Làm ơn gửi báo cáo cho tôi.", main_answer: "Please send me the report.", variations: ["Could you send the report to me", "Send the report please"], hint: { structure: "Please + V + O", vocab: "Send, Report" }, note: "" },
  { id: 203, category: "Công việc", level: "Hard", vietnamese: "Tôi có hạn chót phải hoàn thành.", main_answer: "I have a deadline to meet.", variations: ["I have a deadline", "Ideally I need to finish this by the deadline"], hint: { structure: "S + have + N + to + V", vocab: "Deadline, Meet" }, note: "'Meet a deadline' là kịp hạn chót." },
  { id: 204, category: "Công việc", level: "Medium", vietnamese: "Hãy lên lịch một cuộc họp.", main_answer: "Let's schedule a meeting.", variations: ["Let's set up a meeting", "We should have a meeting"], hint: { structure: "Let's + V + N", vocab: "Schedule, Meeting" }, note: "" },
  { id: 205, category: "Công việc", level: "Easy", vietnamese: "Tôi đang tìm việc mới.", main_answer: "I am looking for a new job.", variations: ["I'm searching for a new job", "I am job hunting"], hint: { structure: "S + be + looking for + N", vocab: "Look for, Job" }, note: "" },

  // --- Cảm xúc (10 câu) ---
  { id: 4, category: "Cảm xúc", level: "Medium", vietnamese: "Tôi không đồng ý với bạn.", main_answer: "I do not agree with you.", variations: ["I don't agree", "I disagree with you"], hint: { structure: "S + do not + V + with + O", vocab: "Agree, Disagree" }, note: "Dùng 'I'm afraid I don't agree' để lịch sự hơn." },
  { id: 16, category: "Cảm xúc", level: "Easy", vietnamese: "Tôi đang cảm thấy rất mệt.", main_answer: "I am feeling very tired.", variations: ["I feel exhausted", "I'm so tired"], hint: { structure: "S + be + feeling + Adj", vocab: "Tired, Feeling" }, note: "'Exhausted' dùng khi cực kỳ mệt mỏi." },
  { id: 17, category: "Cảm xúc", level: "Medium", vietnamese: "Đừng lo lắng về điều đó.", main_answer: "Don't worry about that.", variations: ["No need to worry", "Forget about it"], hint: { structure: "Don't + V + about + N", vocab: "Worry" }, note: "" },
  { id: 18, category: "Cảm xúc", level: "Hard", vietnamese: "Tôi rất trân trọng sự giúp đỡ của bạn.", main_answer: "I really appreciate your help.", variations: ["I'm so grateful for your help", "Thank you so much for helping me"], hint: { structure: "S + appreciate + O", vocab: "Appreciate, Help" }, note: "" },
  { id: 301, category: "Cảm xúc", level: "Medium", vietnamese: "Tôi rất hào hứng về tin tức này.", main_answer: "I am very excited about the news.", variations: ["I'm thrilled about the news", "The news is exciting"], hint: { structure: "S + be + Adj + about + N", vocab: "Excited, News" }, note: "" },
  { id: 302, category: "Cảm xúc", level: "Medium", vietnamese: "Tôi cảm thấy hơi lo lắng.", main_answer: "I feel a bit nervous.", variations: ["I'm a little anxious", "I feel worried"], hint: { structure: "S + feel + Adj", vocab: "Nervous" }, note: "" },
  { id: 303, category: "Cảm xúc", level: "Medium", vietnamese: "Điều đó thật phiền phức.", main_answer: "That is really annoying.", variations: ["It's so annoying", "That bothers me"], hint: { structure: "That + be + Adj", vocab: "Annoying" }, note: "" },
  { id: 304, category: "Cảm xúc", level: "Easy", vietnamese: "Tôi rất tự hào về bạn.", main_answer: "I am so proud of you.", variations: ["I'm really proud of you"], hint: { structure: "S + be + proud of + O", vocab: "Proud" }, note: "" },
  { id: 305, category: "Cảm xúc", level: "Easy", vietnamese: "Tôi chán quá.", main_answer: "I am bored.", variations: ["I feel bored", "It's boring"], hint: { structure: "S + be + Adj", vocab: "Bored" }, note: "Bored (bị chán) khác với Boring (tẻ nhạt)." },
  { id: 306, category: "Cảm xúc", level: "Easy", vietnamese: "Nghe tuyệt quá.", main_answer: "That sounds wonderful.", variations: ["That sounds great", "That's awesome"], hint: { structure: "That + sounds + Adj", vocab: "Wonderful, Sound" }, note: "" },

  // --- Du lịch (10 câu) ---
  { id: 5, category: "Du lịch", level: "Easy", vietnamese: "Nhà vệ sinh ở đâu?", main_answer: "Where is the restroom?", variations: ["Where's the toilet", "Where is the bathroom"], hint: { structure: "Where + is + the + Place?", vocab: "Restroom, Toilet" }, note: "Mỹ dùng 'Restroom', Anh dùng 'Toilet'." },
  { id: 26, category: "Du lịch", level: "Easy", vietnamese: "Trạm xe buýt gần nhất ở đâu?", main_answer: "Where is the nearest bus station?", variations: ["Where is the closest bus stop", "Do you know where the bus stop is"], hint: { structure: "Where + is + the + nearest + Place?", vocab: "Bus station, Nearest" }, note: "" },
  { id: 27, category: "Du lịch", level: "Easy", vietnamese: "Hiệu thuốc ở đâu?", main_answer: "Where is the pharmacy?", variations: ["Where is the drugstore", "Is there a pharmacy nearby"], hint: { structure: "Where + is + the + Place?", vocab: "Pharmacy" }, note: "" },
  { id: 8, category: "Du lịch", level: "Medium", vietnamese: "Chuyến bay tiếp theo đến London khi nào khởi hành?", main_answer: "When does the next flight to London depart?", variations: ["When is the next flight to London leaving"], hint: { structure: "When + does + S + V?", vocab: "Depart, Flight" }, note: "" },
  { id: 19, category: "Du lịch", level: "Medium", vietnamese: "Tôi có thể mua vé ở đâu?", main_answer: "Where can I buy a ticket?", variations: ["Where do I get a ticket", "Where is the ticket office"], hint: { structure: "Where + can + I + V + O?", vocab: "Ticket, Buy" }, note: "" },
  { id: 20, category: "Du lịch", level: "Hard", vietnamese: "Làm ơn cho tôi biết đường đến ga tàu điện ngầm.", main_answer: "Please tell me the way to the subway station.", variations: ["How do I get to the subway station", "Where is the nearest subway"], hint: { structure: "Tell + O + the way + to + N", vocab: "Subway, Station" }, note: "" },
  { id: 28, category: "Du lịch", level: "Hard", vietnamese: "Làm ơn chỉ đường cho tôi đến viện bảo tàng.", main_answer: "Please show me the way to the museum.", variations: ["How do I get to the museum", "Can you direct me to the museum"], hint: { structure: "Show/Tell + O + the way + to + N", vocab: "Museum, Way" }, note: "" },
  { id: 29, category: "Du lịch", level: "Medium", vietnamese: "Tôi muốn đặt phòng khách sạn.", main_answer: "I would like to book a hotel room.", variations: ["I want to reserve a room", "Do you have any rooms available"], hint: { structure: "S + would like to + book + O", vocab: "Hotel room, Book" }, note: "Chuyển từ mục Nhà hàng sang đây cho hợp lý." },
  { id: 401, category: "Du lịch", level: "Easy", vietnamese: "Vé bao nhiêu tiền?", main_answer: "How much is the ticket?", variations: ["What is the price of the ticket", "How much does the ticket cost"], hint: { structure: "How much + be + S?", vocab: "Ticket, How much" }, note: "" },
  { id: 402, category: "Du lịch", level: "Hard", vietnamese: "Tôi bị mất hộ chiếu.", main_answer: "I have lost my passport.", variations: ["I lost my passport", "My passport is missing"], hint: { structure: "S + have + V3 + O", vocab: "Lost, Passport" }, note: "Thì hiện tại hoàn thành dùng cho sự việc vừa xảy ra." },

  // --- Nhà hàng (10 câu) ---
  { id: 6, category: "Nhà hàng", level: "Easy", vietnamese: "Tôi có thể xem thực đơn được không?", main_answer: "Can I see the menu?", variations: ["May I see the menu", "Could I have the menu please"], hint: { structure: "Can/May + I + V + O?", vocab: "See, Menu" }, note: "" },
  { id: 9, category: "Nhà hàng", level: "Medium", vietnamese: "Tôi muốn đặt bàn cho hai người.", main_answer: "I would like to book a table for two.", variations: ["Can I reserve a table for two", "Table for two please"], hint: { structure: "S + would like to + book + O", vocab: "Book, Table" }, note: "" },
  { id: 21, category: "Nhà hàng", level: "Medium", vietnamese: "Tính tiền cho tôi nhé.", main_answer: "Check, please.", variations: ["Could I have the bill, please", "Can I pay now"], hint: { structure: "Phrase + please", vocab: "Check, Bill" }, note: "" },
  { id: 22, category: "Nhà hàng", level: "Hard", vietnamese: "Món này có quá cay không?", main_answer: "Is this dish too spicy?", variations: ["How spicy is this", "Is it very hot"], hint: { structure: "Is + S + too + Adj?", vocab: "Spicy, Dish" }, note: "" },
  { id: 501, category: "Nhà hàng", level: "Medium", vietnamese: "Bạn gợi ý món gì?", main_answer: "What do you recommend?", variations: ["Do you have any recommendations", "What is good here"], hint: { structure: "What + do + you + V?", vocab: "Recommend" }, note: "" },
  { id: 502, category: "Nhà hàng", level: "Medium", vietnamese: "Tôi muốn một bàn cạnh cửa sổ.", main_answer: "I would like a table by the window.", variations: ["Can I have a window seat", "A table near the window please"], hint: { structure: "S + would like + O + Prep + N", vocab: "Table, Window" }, note: "" },
  { id: 503, category: "Nhà hàng", level: "Easy", vietnamese: "Cho tôi xin chút nước được không?", main_answer: "Can I have some water, please?", variations: ["Could I get some water", "Water please"], hint: { structure: "Can I + have + N?", vocab: "Water" }, note: "" },
  { id: 504, category: "Nhà hàng", level: "Easy", vietnamese: "Món này ngon quá.", main_answer: "This food is delicious.", variations: ["It tastes good", "This is very tasty"], hint: { structure: "S + be + Adj", vocab: "Delicious, Food" }, note: "" },
  { id: 505, category: "Nhà hàng", level: "Medium", vietnamese: "Bạn có nhận thẻ tín dụng không?", main_answer: "Do you accept credit cards?", variations: ["Can I pay by credit card", "Do you take cards"], hint: { structure: "Do you + V + O?", vocab: "Accept, Credit card" }, note: "" },
  { id: 506, category: "Nhà hàng", level: "Hard", vietnamese: "Tôi ăn chay.", main_answer: "I am a vegetarian.", variations: ["I'm vegetarian", "I do not eat meat"], hint: { structure: "S + be + N/Adj", vocab: "Vegetarian" }, note: "" },

  // --- Hàng ngày (10 câu) ---
  { id: 7, category: "Hàng ngày", level: "Easy", vietnamese: "Bây giờ là mấy giờ?", main_answer: "What time is it?", variations: ["What is the time", "Do you have the time"], hint: { structure: "What + time + is + it?", vocab: "Time" }, note: "" },
  { id: 23, category: "Hàng ngày", level: "Easy", vietnamese: "Hôm nay thời tiết thế nào?", main_answer: "How is the weather today?", variations: ["What's the weather like today", "Is it nice outside"], hint: { structure: "How + is + the + N?", vocab: "Weather" }, note: "" },
  { id: 24, category: "Hàng ngày", level: "Medium", vietnamese: "Tôi phải đi siêu thị mua một ít đồ ăn.", main_answer: "I have to go to the supermarket to buy some food.", variations: ["I need to go grocery shopping"], hint: { structure: "S + have to + V + to + V", vocab: "Supermarket, Food" }, note: "" },
  { id: 31, category: "Hàng ngày", level: "Medium", vietnamese: "Tôi phải đi đến trường để đón con.", main_answer: "I have to go to school to pick up my children.", variations: ["I need to pick up my kids at school"], hint: { structure: "S + have to + V + to + V", vocab: "School, Pick up" }, note: "" },
  { id: 25, category: "Hàng ngày", level: "Medium", vietnamese: "Bạn thường làm gì vào cuối tuần?", main_answer: "What do you usually do at the weekend?", variations: ["What are your weekend plans", "What do you do for fun on weekends"], hint: { structure: "What + do + S + usually + do?", vocab: "Weekend, Usually" }, note: "Anh-Anh dùng 'at the weekend', Anh-Mỹ dùng 'on the weekend'." },
  { id: 601, category: "Hàng ngày", level: "Medium", vietnamese: "Tôi dậy lúc 7h sáng mỗi ngày.", main_answer: "I wake up at 7 am every day.", variations: ["I get up at 7 daily"], hint: { structure: "S + V + at + Time", vocab: "Wake up, 7 am" }, note: "" },
  { id: 602, category: "Hàng ngày", level: "Easy", vietnamese: "Bạn ngủ có ngon không?", main_answer: "Did you sleep well?", variations: ["How did you sleep", "Did you have a good sleep"], hint: { structure: "Did + S + V + Adv?", vocab: "Sleep, Well" }, note: "" },
  { id: 603, category: "Hàng ngày", level: "Easy", vietnamese: "Bữa tối có món gì?", main_answer: "What is for dinner?", variations: ["What are we having for dinner"], hint: { structure: "What + be + for + N?", vocab: "Dinner" }, note: "" },
  { id: 604, category: "Hàng ngày", level: "Easy", vietnamese: "Tôi đang đi tập gym.", main_answer: "I am going to the gym.", variations: ["I'm heading to the gym", "I'm working out"], hint: { structure: "S + be + V-ing + ...", vocab: "Gym, Go" }, note: "" },
  { id: 605, category: "Hàng ngày", level: "Medium", vietnamese: "Bạn tắt đèn giúp tôi được không?", main_answer: "Can you turn off the light?", variations: ["Could you switch off the light", "Turn off the light please"], hint: { structure: "Can you + V + O?", vocab: "Turn off, Light" }, note: "" },

  // --- Gia đình (NEW - 10 câu) ---
  { id: 701, category: "Gia đình", level: "Medium", vietnamese: "Bạn có bao nhiêu anh chị em?", main_answer: "How many siblings do you have?", variations: ["Do you have any brothers or sisters", "How many brothers and sisters do you have"], hint: { structure: "How many + N + do + S + have?", vocab: "Siblings" }, note: "Sibling là từ chung chỉ anh chị em." },
  { id: 702, category: "Gia đình", level: "Medium", vietnamese: "Bạn có sống cùng bố mẹ không?", main_answer: "Do you live with your parents?", variations: ["Are you living with your parents"], hint: { structure: "Do + S + V + with + O?", vocab: "Live, Parents" }, note: "" },
  { id: 703, category: "Gia đình", level: "Easy", vietnamese: "Bạn đã kết hôn chưa?", main_answer: "Are you married?", variations: ["Do you have a spouse", "Are you single or married"], hint: { structure: "Are + S + Adj?", vocab: "Married" }, note: "" },
  { id: 704, category: "Gia đình", level: "Easy", vietnamese: "Tôi có 2 con.", main_answer: "I have two children.", variations: ["I've got two kids", "I am a parent of two"], hint: { structure: "S + have + Number + N", vocab: "Children" }, note: "" },
  { id: 705, category: "Gia đình", level: "Easy", vietnamese: "Gia đình tôi rất thân thiết.", main_answer: "My family is very close.", variations: ["We are a close-knit family"], hint: { structure: "S + be + Adj", vocab: "Family, Close" }, note: "" },
  { id: 706, category: "Gia đình", level: "Medium", vietnamese: "Bố tôi là bác sĩ.", main_answer: "My father is a doctor.", variations: ["My dad works as a doctor"], hint: { structure: "S + be + a/an + Job", vocab: "Father, Doctor" }, note: "" },
  { id: 707, category: "Gia đình", level: "Medium", vietnamese: "Chúng tôi thường ăn tối cùng nhau.", main_answer: "We usually eat dinner together.", variations: ["We often have dinner together"], hint: { structure: "S + Adv + V + O", vocab: "Usually, Together" }, note: "" },
  { id: 708, category: "Gia đình", level: "Medium", vietnamese: "Tôi sẽ đi thăm ông bà.", main_answer: "I am going to visit my grandparents.", variations: ["I'm visiting my grandparents"], hint: { structure: "S + be + going to + V + O", vocab: "Visit, Grandparents" }, note: "" },
  { id: 709, category: "Gia đình", level: "Easy", vietnamese: "Cô ấy là em gái tôi.", main_answer: "She is my younger sister.", variations: ["That's my little sister"], hint: { structure: "S + be + Possessive + N", vocab: "Younger sister" }, note: "" },
  { id: 710, category: "Gia đình", level: "Hard", vietnamese: "Tôi rất yêu gia đình mình.", main_answer: "I love my family very much.", variations: ["I love my family a lot", "My family means everything to me"], hint: { structure: "S + V + O + Adv", vocab: "Love, Family" }, note: "" },

  // --- Sức khỏe (NEW - 10 câu) ---
  { id: 801, category: "Sức khỏe", level: "Easy", vietnamese: "Tôi bị đau đầu.", main_answer: "I have a headache.", variations: ["My head hurts", "I've got a headache"], hint: { structure: "S + have + a + N", vocab: "Headache" }, note: "" },
  { id: 802, category: "Sức khỏe", level: "Medium", vietnamese: "Tôi cần gặp bác sĩ.", main_answer: "I need to see a doctor.", variations: ["I have to go to the doctor"], hint: { structure: "S + need to + V + O", vocab: "See, Doctor" }, note: "" },
  { id: 803, category: "Sức khỏe", level: "Easy", vietnamese: "Tôi bị sốt.", main_answer: "I have a fever.", variations: ["I'm running a fever", "I have a high temperature"], hint: { structure: "S + have + a + N", vocab: "Fever" }, note: "" },
  { id: 804, category: "Sức khỏe", level: "Medium", vietnamese: "Tôi bị đau bụng.", main_answer: "My stomach hurts.", variations: ["I have a stomachache", "My belly hurts"], hint: { structure: "S + V", vocab: "Stomach, Hurts" }, note: "" },
  { id: 805, category: "Sức khỏe", level: "Hard", vietnamese: "Bạn có bị dị ứng không?", main_answer: "Do you have any allergies?", variations: ["Are you allergic to anything"], hint: { structure: "Do + S + have + N?", vocab: "Allergies" }, note: "" },
  { id: 806, category: "Sức khỏe", level: "Medium", vietnamese: "Tôi thấy chóng mặt.", main_answer: "I feel dizzy.", variations: ["My head is spinning", "I'm feeling lightheaded"], hint: { structure: "S + feel + Adj", vocab: "Dizzy" }, note: "" },
  { id: 807, category: "Sức khỏe", level: "Hard", vietnamese: "Uống thuốc này sau khi ăn.", main_answer: "Take this medicine after meals.", variations: ["Take the medication after eating"], hint: { structure: "V + O + Prep + N", vocab: "Take medicine, After" }, note: "" },
  { id: 808, category: "Sức khỏe", level: "Hard", vietnamese: "Gọi xe cấp cứu đi.", main_answer: "Call an ambulance.", variations: ["Call 911", "Get an ambulance"], hint: { structure: "V + O", vocab: "Call, Ambulance" }, note: "" },
  { id: 809, category: "Sức khỏe", level: "Medium", vietnamese: "Tôi bị cảm lạnh.", main_answer: "I caught a cold.", variations: ["I have a cold"], hint: { structure: "S + V + O", vocab: "Caught, Cold" }, note: "" },
  { id: 810, category: "Sức khỏe", level: "Medium", vietnamese: "Bạn nên uống nhiều nước.", main_answer: "You should drink plenty of water.", variations: ["Drink a lot of water"], hint: { structure: "S + should + V + O", vocab: "Drink, Plenty" }, note: "" }
];

export const CATEGORIES: Category[] = [
  'All', 
  'Giao tiếp', 
  'Công việc', 
  'Cảm xúc', 
  'Du lịch', 
  'Nhà hàng', 
  'Hàng ngày',
  'Gia đình',
  'Sức khỏe'
];
